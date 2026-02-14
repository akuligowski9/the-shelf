const express = require('express');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Check if demo mode is enabled
const isDemoMode = process.env.DEMO_MODE === 'true';
const RESET_SECRET = process.env.DEMO_RESET_SECRET || 'demo-reset-secret';

// Fictional demo targets
const DEMO_TARGETS = [
  {
    name: 'Learn 10 jazz standards',
    status: 'active',
    habit_name: 'Music',
    start_date: '2025-09-01',
    planned_duration: '6 months',
    notes: 'Building repertoire for open mic nights. Currently on standard #6.'
  },
  {
    name: 'French A2 certification',
    status: 'active',
    habit_name: 'French',
    start_date: '2025-10-01',
    end_date: '2026-03-01',
    notes: 'DELF A2 exam scheduled for March.'
  },
  {
    name: 'Half marathon',
    status: 'active',
    habit_name: 'Fitness',
    start_date: '2025-11-01',
    end_date: '2026-04-15',
    notes: 'Spring race. Following 20-week training plan.'
  },
  {
    name: 'Photo essay: City at Dawn',
    status: 'active',
    habit_name: 'Photography',
    start_date: '2025-12-01',
    planned_duration: '3 months',
    notes: '20-image series capturing early morning urban life.'
  },
  {
    name: 'Read 24 books this year',
    status: 'active',
    habit_name: 'Reading',
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    notes: '2 books per month goal. Mix of genres.'
  },
  {
    name: 'Master croissants',
    status: 'parked',
    habit_name: 'Cooking',
    planned_duration: '2 months',
    notes: 'Paused until kitchen renovation complete.'
  },
  {
    name: 'Autumn Leaves (jazz standard)',
    status: 'completed',
    habit_name: 'Music',
    start_date: '2025-09-15',
    end_date: '2025-10-20',
    notes: 'First standard learned! Can play melody and basic chord changes.'
  },
  {
    name: 'Couch to 10K',
    status: 'completed',
    habit_name: 'Fitness',
    start_date: '2025-08-01',
    end_date: '2025-10-31',
    notes: 'Built running base before half marathon training.'
  }
];

// GET /demo/status - Returns demo mode status
router.get('/status', (_req, res) => {
  res.json({
    ok: true,
    demo_mode: isDemoMode,
    message: isDemoMode
      ? 'This is a demo instance. Data resets hourly.'
      : 'Demo mode is disabled.'
  });
});

// POST /demo/reset - Reset database to demo data (only in demo mode)
// Accepts either DEMO_MODE=true or a secret key in header/query for scheduled resets
router.post('/reset', async (req, res) => {
  const providedSecret = req.headers['x-reset-secret'] || req.query.secret;
  const isAuthorized = isDemoMode || providedSecret === RESET_SECRET;

  if (!isAuthorized) {
    return res.status(403).json({
      ok: false,
      error: 'Demo reset requires DEMO_MODE=true or valid reset secret'
    });
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://shelf:shelf@localhost:5432/shelf'
  });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Ensure schema is up-to-date (demo DB may be missing migrations)
    await client.query(`ALTER TABLE actions ADD COLUMN IF NOT EXISTS sort_order INT`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS habit_prompts (
        id SERIAL PRIMARY KEY,
        habit_id INT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
        type TEXT NOT NULL CHECK (type IN ('warmup', 'cooldown')),
        name TEXT NOT NULL,
        content TEXT NOT NULL,
        active BOOLEAN DEFAULT true,
        has_dynamic_elements BOOLEAN DEFAULT false,
        sort_order INT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await client.query(`ALTER TABLE habit_prompts ADD COLUMN IF NOT EXISTS has_dynamic_elements BOOLEAN DEFAULT false`);
    await client.query(`ALTER TABLE habit_prompts ADD COLUMN IF NOT EXISTS sort_order INT`);
    await client.query(`ALTER TABLE habit_prompts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()`);

    // Clear existing data
    await client.query('DELETE FROM reflections');
    await client.query('DELETE FROM closures');
    await client.query('DELETE FROM preparations');
    await client.query('DELETE FROM entries');
    await client.query('DELETE FROM targets');
    await client.query('DELETE FROM actions');
    await client.query('DELETE FROM practices');
    await client.query('DELETE FROM habit_prompts');
    await client.query('DELETE FROM habit_transitions');
    await client.query('DELETE FROM habits');

    // Load demo-habits.json (fictional data)
    // Check multiple paths for dev vs production
    let habitsPath = path.join(__dirname, '..', 'data', 'demo', 'demo-habits.json');
    if (!fs.existsSync(habitsPath)) {
      habitsPath = path.join(__dirname, '..', '..', '..', 'data', 'demo', 'demo-habits.json');
    }
    const habitsData = JSON.parse(fs.readFileSync(habitsPath, 'utf8'));

    const habitIdByName = {};
    const practiceIdByHabitAndName = {};

    // Insert habits
    for (const habit of habitsData.habits) {
      const habitType = habit.type || (habit.name === 'Caution Behaviors' ? 'caution' : 'habit');
      await client.query(
        `INSERT INTO habits (id, name, type, active, color, target_minutes, track_actions)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [habit.id, habit.name, habitType, habit.active, habit.color, habit.target_minutes || 60, habit.track_actions]
      );
      habitIdByName[habit.name] = habit.id;

      for (const practice of habit.practices) {
        await client.query(
          `INSERT INTO practices (id, habit_id, name, active)
           VALUES ($1, $2, $3, $4)`,
          [practice.id, habit.id, practice.name, practice.active]
        );

        const key = `${habit.name}:${practice.name}`;
        practiceIdByHabitAndName[key] = practice.id;

        if (practice.actions && practice.actions.length > 0) {
          for (const actionName of practice.actions) {
            await client.query(
              `INSERT INTO actions (practice_id, name, active)
               VALUES ($1, $2, $3)`,
              [practice.id, actionName, true]
            );
          }
        }
      }
    }

    // Reset sequences
    await client.query(`SELECT setval('habits_id_seq', (SELECT COALESCE(MAX(id), 1) FROM habits))`);
    await client.query(`SELECT setval('practices_id_seq', (SELECT COALESCE(MAX(id), 1) FROM practices))`);

    // Create targets BEFORE entries so we can link them
    const targetIdByName = {};
    for (const target of DEMO_TARGETS) {
      const habitId = target.habit_name ? habitIdByName[target.habit_name] : null;
      const result = await client.query(
        `INSERT INTO targets (name, status, habit_id, start_date, end_date, planned_duration, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          target.name,
          target.status,
          habitId,
          target.start_date || null,
          target.end_date || null,
          target.planned_duration || null,
          target.notes || null
        ]
      );
      targetIdByName[target.name] = result.rows[0].id;
    }

    // Load demo log files
    let demoLogsPath = path.join(__dirname, '..', 'data', 'demo');
    if (!fs.existsSync(demoLogsPath)) {
      demoLogsPath = path.join(__dirname, '..', '..', '..', 'data', 'demo');
    }
    const logFiles = fs.readdirSync(demoLogsPath).filter(f => f.endsWith('.json') && f !== 'demo-habits.json').sort();

    let entryCount = 0;
    let prepCount = 0;
    let closureCount = 0;
    let reflectionCount = 0;

    for (const logFile of logFiles) {
      const logPath = path.join(demoLogsPath, logFile);
      const logData = JSON.parse(fs.readFileSync(logPath, 'utf8'));
      const date = logData.date;

      // Process preparations
      if (logData.preparations) {
        for (const prep of logData.preparations) {
          const periodStart = date;
          const periodType = prep.period_type || 'day';

          const existing = await client.query(
            `SELECT id FROM preparations WHERE period_type = $1 AND period_start = $2`,
            [periodType, periodStart]
          );

          if (existing.rows.length === 0) {
            await client.query(
              `INSERT INTO preparations (period_type, period_start, note, rest_day)
               VALUES ($1, $2, $3, $4)`,
              [periodType, periodStart, prep.note || null, prep.rest_day || false]
            );
            prepCount++;
          }
        }
      }

      // Process entries
      if (logData.entries) {
        for (const entry of logData.entries) {
          let habitId = null;
          let practiceId = null;
          let targetId = null;

          // Handle habit entries
          if (entry.type === 'habit' && entry.habit) {
            habitId = habitIdByName[entry.habit];
            if (!habitId) continue;

            if (entry.practice) {
              const practiceKey = `${entry.habit}:${entry.practice}`;
              practiceId = practiceIdByHabitAndName[practiceKey];
            }
          }

          // Handle caution entries
          if (entry.type === 'caution') {
            habitId = habitIdByName['Caution Behaviors'];
            if (entry.practice) {
              const practiceKey = `Caution Behaviors:${entry.practice}`;
              practiceId = practiceIdByHabitAndName[practiceKey];
            }
          }

          // Link to target if specified
          if (entry.target && targetIdByName[entry.target]) {
            targetId = targetIdByName[entry.target];
          }

          const occurredAt = entry.occurred_at || `${date}T12:00:00`;

          await client.query(
            `INSERT INTO entries (type, occurred_at, habit_id, practice_id, target_id, duration_minutes, note, source, is_highlight)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              entry.type,
              occurredAt,
              habitId,
              practiceId,
              targetId,
              entry.duration_minutes || null,
              entry.note || null,
              'import',
              entry.is_highlight || false
            ]
          );
          entryCount++;
        }
      }

      // Process closures
      if (logData.closures) {
        for (const closure of logData.closures) {
          const occurredAt = closure.occurred_at || `${date}T23:00:00`;
          await client.query(
            `INSERT INTO closures (scope, occurred_at, note)
             VALUES ($1, $2, $3)`,
            [closure.scope || 'day', occurredAt, closure.note || null]
          );
          closureCount++;
        }
      }

      // Process reflections
      if (logData.reflections) {
        for (const reflection of logData.reflections) {
          await client.query(
            `INSERT INTO reflections (reflection_type, period_start, period_end, note)
             VALUES ($1, $2, $3, $4)`,
            ['day', date, date, reflection.note]
          );
          reflectionCount++;
        }
      }
    }

    // Add weekly reflections
    const weeklyReflections = [
      {
        start: '2025-12-30', end: '2026-01-05',
        note: '## Week 1 Reflection\n\n**What went well:**\n- Strong start to the reading goal (finished 1 book already)\n- Good running base maintained over holidays\n- French streak unbroken\n\n**What to improve:**\n- Guitar practice was spotty over New Year\n- Need to establish morning routine again\n\n**Focus for next week:**\n- Get back to consistent music practice\n- Start selecting images for photo essay'
      },
      {
        start: '2026-01-13', end: '2026-01-19',
        note: '## Week 3 Reflection\n\n**What went well:**\n- Great progress on photo essay\n- French conversation improving\n- Consistent running schedule\n\n**What to improve:**\n- More focused guitar practice\n- Earlier bedtimes\n\n**Focus for next week:**\n- Finish photo essay selections\n- 14K long run'
      },
      {
        start: '2026-01-27', end: '2026-02-02',
        note: '## Week 5 Reflection\n\n**What went well:**\n- Photo essay nearly complete — 18 of 20 images selected\n- Hit 14K long run milestone\n- Finished book #3 ahead of schedule\n\n**What to improve:**\n- French conversation sessions slipped this week\n- Too many late nights\n\n**Focus for next week:**\n- Schedule 2 French conversation sessions\n- Submit photo essay draft for feedback'
      },
      {
        start: '2026-02-10', end: '2026-02-16',
        note: '## Week 7 Reflection\n\n**What went well:**\n- Submitted photo essay — feels like a real accomplishment\n- Half marathon training on track, 16K long run done\n- Guitar practice more consistent this week\n\n**What to improve:**\n- Caution behaviors crept up mid-week\n- Strength training dropped to 1x this week\n\n**Focus for next week:**\n- 2 strength sessions minimum\n- Start jazz standard #7 (Blue Bossa)'
      }
    ];

    for (const ref of weeklyReflections) {
      await client.query(
        `INSERT INTO reflections (reflection_type, period_start, period_end, note)
         VALUES ($1, $2, $3, $4)`,
        ['weekly', ref.start, ref.end, ref.note]
      );
    }

    // Add habit transition (Cooking paused)
    await client.query(
      `INSERT INTO habit_transitions (started_at, ended_at, note, changes, cascades)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        '2025-11-15T10:00:00Z',
        '2025-11-15T10:05:00Z',
        'Kitchen renovation starting. Pausing cooking habit until complete.',
        JSON.stringify([
          { habit_id: habitIdByName['Cooking'], field: 'active', from: true, to: false }
        ]),
        JSON.stringify({
          practices_deactivated: ['New Recipes', 'Baking', 'Meal Prep']
        })
      ]
    );

    await client.query('COMMIT');

    res.json({
      ok: true,
      message: 'Demo data has been reset',
      counts: {
        habits: Object.keys(habitIdByName).length,
        entries: entryCount,
        preparations: prepCount,
        closures: closureCount,
        reflections: reflectionCount + 1,
        targets: DEMO_TARGETS.length,
        transitions: 1
      }
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Demo reset failed:', err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    client.release();
    await pool.end();
  }
});

module.exports = router;
