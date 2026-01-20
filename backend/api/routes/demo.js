const express = require('express');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Check if demo mode is enabled
const isDemoMode = process.env.DEMO_MODE === 'true';

// GET /demo/status - Returns demo mode status
router.get('/status', (_req, res) => {
  res.json({
    ok: true,
    demo_mode: isDemoMode,
    message: isDemoMode
      ? 'This is a demo instance. Data may be reset periodically.'
      : 'Demo mode is disabled.'
  });
});

// Demo targets data
const DEMO_TARGETS = [
  {
    name: 'Build a habit tracking mobile app',
    status: 'active',
    habit_name: 'Software',
    planned_duration: '3 months',
    notes: 'React Native app with offline support and sync capabilities.'
  },
  {
    name: 'Complete Spanish B1 certification',
    status: 'planned',
    habit_name: 'Spanish',
    planned_duration: '6 months',
    notes: 'Focus on conversation skills and vocabulary building.'
  },
  {
    name: 'Run a 10K race',
    status: 'active',
    habit_name: 'Exercise',
    start_date: '2026-01-01',
    end_date: '2026-03-15',
    notes: 'Training plan with gradual distance increase.'
  },
  {
    name: 'Read 12 books this year',
    status: 'active',
    habit_name: 'Reading',
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    notes: 'Mix of fiction and non-fiction.'
  },
  {
    name: 'Teach Luna loose-leash walking',
    status: 'parked',
    habit_name: 'Dog Training',
    planned_duration: '2 months',
    notes: 'Paused until weather improves.'
  },
  {
    name: 'Refactor API authentication',
    status: 'completed',
    habit_name: 'Software',
    start_date: '2025-12-01',
    end_date: '2025-12-15',
    notes: 'Migrated from sessions to JWT tokens.'
  }
];

// POST /demo/reset - Reset database to demo data (only in demo mode)
router.post('/reset', async (_req, res) => {
  if (!isDemoMode) {
    return res.status(403).json({
      ok: false,
      error: 'Demo reset is only available when DEMO_MODE=true'
    });
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://shelf:shelf@localhost:5432/shelf'
  });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Clear existing data
    await client.query('DELETE FROM reflections');
    await client.query('DELETE FROM closures');
    await client.query('DELETE FROM preparations');
    await client.query('DELETE FROM entries');
    await client.query('DELETE FROM targets');
    await client.query('DELETE FROM actions');
    await client.query('DELETE FROM practices');
    await client.query('DELETE FROM habits');

    // Load habits.json
    const habitsPath = path.join(__dirname, '..', '..', '..', 'data', 'habits.json');
    const habitsData = JSON.parse(fs.readFileSync(habitsPath, 'utf8'));

    const habitIdByName = {};
    const practiceIdByHabitAndName = {};

    // Insert habits
    for (const habit of habitsData.habits) {
      await client.query(
        `INSERT INTO habits (id, name, active, color, target_minutes, track_actions)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [habit.id, habit.name, habit.active, habit.color, habit.target_minutes || 60, habit.track_actions]
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

    // Add practice aliases
    if (habitsData.practice_aliases) {
      for (const [alias, targetName] of Object.entries(habitsData.practice_aliases)) {
        for (const [key, id] of Object.entries(practiceIdByHabitAndName)) {
          if (key.endsWith(`:${targetName}`)) {
            const habitName = key.split(':')[0];
            practiceIdByHabitAndName[`${habitName}:${alias}`] = id;
          }
        }
      }
    }

    // Reset sequences
    await client.query(`SELECT setval('habits_id_seq', (SELECT COALESCE(MAX(id), 1) FROM habits))`);
    await client.query(`SELECT setval('practices_id_seq', (SELECT COALESCE(MAX(id), 1) FROM practices))`);

    // Load demo log files
    const demoLogsPath = path.join(__dirname, '..', '..', '..', 'data', 'logs', 'demo');
    const logFiles = fs.readdirSync(demoLogsPath).filter(f => f.endsWith('.json')).sort();

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

          if (entry.type === 'habit' && entry.habit) {
            habitId = habitIdByName[entry.habit];
            if (!habitId) continue;

            if (entry.practice) {
              const practiceKey = `${entry.habit}:${entry.practice}`;
              practiceId = practiceIdByHabitAndName[practiceKey];
            }
          }

          const occurredAt = entry.occurred_at || `${date}T12:00:00`;

          await client.query(
            `INSERT INTO entries (type, occurred_at, habit_id, practice_id, duration_minutes, note, source)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              entry.type,
              occurredAt,
              habitId,
              practiceId,
              entry.duration_minutes || null,
              entry.note || null,
              'import'
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

    // Create demo targets
    for (const target of DEMO_TARGETS) {
      const habitId = target.habit_name ? habitIdByName[target.habit_name] : null;

      await client.query(
        `INSERT INTO targets (name, status, habit_id, start_date, end_date, planned_duration, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
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
    }

    // Add weekly reflection
    await client.query(
      `INSERT INTO reflections (reflection_type, period_start, period_end, note)
       VALUES ($1, $2, $3, $4)`,
      [
        'weekly',
        '2026-01-06',
        '2026-01-12',
        '## Week 2 Reflection\n\n**What went well:**\n- Consistent exercise routine\n- Good progress on software project\n- Quality reading time\n\n**What to improve:**\n- Earlier bedtimes\n- More focused dog training sessions\n\n**Focus for next week:**\n- Complete API refactor\n- Start 10K training plan'
      ]
    );

    await client.query('COMMIT');

    res.json({
      ok: true,
      message: 'Demo data has been reset',
      counts: {
        entries: entryCount,
        preparations: prepCount,
        closures: closureCount,
        reflections: reflectionCount + 1,
        targets: DEMO_TARGETS.length
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
