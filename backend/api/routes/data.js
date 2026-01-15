const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

/**
 * GET /data/export
 * Export all data as JSON for backup/transfer
 */
router.get('/export', async (req, res, next) => {
  try {
    // Fetch all tables in parallel
    const [
      habitsR,
      practicesR,
      actionsR,
      targetsR,
      entriesR,
      preparationsR,
      closuresR,
      reflectionsR,
      settingsR,
      promptsR,
    ] = await Promise.all([
      pool.query('SELECT * FROM habits ORDER BY COALESCE(sort_order, 9999), name'),
      pool.query('SELECT * FROM practices ORDER BY habit_id, COALESCE(sort_order, 9999), name'),
      pool.query('SELECT * FROM actions ORDER BY practice_id, name'),
      pool.query('SELECT * FROM targets ORDER BY COALESCE(sort_order, 9999), created_at'),
      pool.query('SELECT * FROM entries ORDER BY occurred_at'),
      pool.query('SELECT * FROM preparations ORDER BY period_start'),
      pool.query('SELECT * FROM closures ORDER BY occurred_at'),
      pool.query('SELECT * FROM reflections ORDER BY created_at'),
      pool.query('SELECT * FROM settings'),
      pool.query('SELECT * FROM habit_prompts ORDER BY habit_id, type, COALESCE(sort_order, 9999)'),
    ]);

    const exportData = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      habits: habitsR.rows,
      practices: practicesR.rows,
      actions: actionsR.rows,
      targets: targetsR.rows,
      entries: entriesR.rows,
      preparations: preparationsR.rows,
      closures: closuresR.rows,
      reflections: reflectionsR.rows,
      settings: settingsR.rows,
      prompts: promptsR.rows,
    };

    res.json({ ok: true, data: exportData });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /data/import
 * Import data from JSON. Supports two formats:
 * 1. Full export format (has version field) - imports all data
 * 2. Per-day log format (has date field) - imports daily entries
 */
router.post('/import', async (req, res, next) => {
  const data = req.body;
  const results = {
    entries: { inserted: 0, skipped: 0 },
    preparations: { inserted: 0, skipped: 0 },
    closures: { inserted: 0, skipped: 0 },
    reflections: { inserted: 0, skipped: 0 },
    habits: { inserted: 0, skipped: 0 },
    practices: { inserted: 0, skipped: 0 },
    actions: { inserted: 0, skipped: 0 },
    targets: { inserted: 0, skipped: 0 },
    prompts: { inserted: 0, skipped: 0 },
  };

  try {
    // Determine import format
    const isFullExport = data.version !== undefined;
    const isDayLog = data.date !== undefined;

    if (!isFullExport && !isDayLog) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid import format. Must have either "version" (full export) or "date" (day log).',
      });
    }

    // Build lookup maps for name -> id resolution
    const habitsR = await pool.query('SELECT id, name FROM habits');
    const habitMap = new Map(habitsR.rows.map(h => [h.name.toLowerCase(), h.id]));

    const practicesR = await pool.query('SELECT id, name, habit_id FROM practices');
    const practiceMap = new Map();
    practicesR.rows.forEach(p => {
      practiceMap.set(`${p.habit_id}:${p.name.toLowerCase()}`, p.id);
    });

    const targetsR = await pool.query('SELECT id, name FROM targets');
    const targetMap = new Map(targetsR.rows.map(t => [t.name.toLowerCase(), t.id]));

    // Helper to resolve habit name to ID
    const resolveHabitId = (habitName) => {
      if (!habitName) return null;
      return habitMap.get(habitName.toLowerCase()) || null;
    };

    // Helper to resolve practice name to ID (needs habit context)
    const resolvePracticeId = (habitId, practiceName) => {
      if (!habitId || !practiceName) return null;
      return practiceMap.get(`${habitId}:${practiceName.toLowerCase()}`) || null;
    };

    // Helper to resolve target name to ID
    const resolveTargetId = (targetName) => {
      if (!targetName) return null;
      return targetMap.get(targetName.toLowerCase()) || null;
    };

    // Full export import - includes structure (habits, practices, etc.)
    if (isFullExport) {
      // Import habits
      if (Array.isArray(data.habits)) {
        for (const habit of data.habits) {
          if (!habit.name) continue;
          const existing = habitMap.get(habit.name.toLowerCase());
          if (existing) {
            results.habits.skipped++;
            continue;
          }
          const r = await pool.query(
            `INSERT INTO habits (name, color, target_minutes, active, track_actions, sort_order, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
            [habit.name, habit.color || 'sage', habit.target_minutes, habit.active !== false, habit.track_actions || false, habit.sort_order, habit.created_at || new Date()]
          );
          habitMap.set(habit.name.toLowerCase(), r.rows[0].id);
          results.habits.inserted++;
        }
      }

      // Import practices
      if (Array.isArray(data.practices)) {
        for (const practice of data.practices) {
          if (!practice.name || !practice.habit_id) continue;
          // Find habit by original ID or name
          let habitId = null;
          if (data.habits) {
            const originalHabit = data.habits.find(h => h.id === practice.habit_id);
            if (originalHabit) {
              habitId = habitMap.get(originalHabit.name.toLowerCase());
            }
          }
          if (!habitId) continue;

          const existing = practiceMap.get(`${habitId}:${practice.name.toLowerCase()}`);
          if (existing) {
            results.practices.skipped++;
            continue;
          }
          const r = await pool.query(
            `INSERT INTO practices (habit_id, name, active, sort_order, created_at)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [habitId, practice.name, practice.active !== false, practice.sort_order, practice.created_at || new Date()]
          );
          practiceMap.set(`${habitId}:${practice.name.toLowerCase()}`, r.rows[0].id);
          results.practices.inserted++;
        }
      }

      // Import actions
      if (Array.isArray(data.actions)) {
        for (const action of data.actions) {
          if (!action.name || !action.practice_id) continue;
          // Find practice by original ID
          let practiceId = null;
          if (data.practices) {
            const originalPractice = data.practices.find(p => p.id === action.practice_id);
            if (originalPractice && data.habits) {
              const originalHabit = data.habits.find(h => h.id === originalPractice.habit_id);
              if (originalHabit) {
                const habitId = habitMap.get(originalHabit.name.toLowerCase());
                practiceId = practiceMap.get(`${habitId}:${originalPractice.name.toLowerCase()}`);
              }
            }
          }
          if (!practiceId) continue;

          // Check if action already exists
          const existingR = await pool.query(
            'SELECT id FROM actions WHERE practice_id = $1 AND LOWER(name) = LOWER($2)',
            [practiceId, action.name]
          );
          if (existingR.rows.length > 0) {
            results.actions.skipped++;
            continue;
          }
          await pool.query(
            `INSERT INTO actions (practice_id, name, active, sort_order, created_at)
             VALUES ($1, $2, $3, $4, $5)`,
            [practiceId, action.name, action.active !== false, action.sort_order, action.created_at || new Date()]
          );
          results.actions.inserted++;
        }
      }

      // Import targets
      if (Array.isArray(data.targets)) {
        for (const target of data.targets) {
          if (!target.name) continue;
          const existing = targetMap.get(target.name.toLowerCase());
          if (existing) {
            results.targets.skipped++;
            continue;
          }
          const habitId = target.habit_id ? (data.habits?.find(h => h.id === target.habit_id)?.name ? habitMap.get(data.habits.find(h => h.id === target.habit_id).name.toLowerCase()) : null) : null;
          const r = await pool.query(
            `INSERT INTO targets (name, habit_id, status, start_date, end_date, done_at, sort_order, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id`,
            [target.name, habitId, target.status || 'active', target.start_date, target.end_date, target.done_at, target.sort_order, target.created_at || new Date()]
          );
          targetMap.set(target.name.toLowerCase(), r.rows[0].id);
          results.targets.inserted++;
        }
      }

      // Import prompts
      if (Array.isArray(data.prompts)) {
        for (const prompt of data.prompts) {
          if (!prompt.name || !prompt.habit_id || !prompt.type) continue;
          // Find habit by original ID
          let habitId = null;
          if (data.habits) {
            const originalHabit = data.habits.find(h => h.id === prompt.habit_id);
            if (originalHabit) {
              habitId = habitMap.get(originalHabit.name.toLowerCase());
            }
          }
          if (!habitId) continue;

          // Check if prompt already exists
          const existingR = await pool.query(
            'SELECT id FROM habit_prompts WHERE habit_id = $1 AND type = $2 AND LOWER(name) = LOWER($3)',
            [habitId, prompt.type, prompt.name]
          );
          if (existingR.rows.length > 0) {
            results.prompts.skipped++;
            continue;
          }
          await pool.query(
            `INSERT INTO habit_prompts (habit_id, type, name, content, has_dynamic_elements, active, sort_order, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [habitId, prompt.type, prompt.name, prompt.content, prompt.has_dynamic_elements || false, prompt.active !== false, prompt.sort_order, prompt.created_at || new Date()]
          );
          results.prompts.inserted++;
        }
      }
    }

    // Import entries (both formats)
    const entries = isFullExport ? data.entries : data.entries;
    if (Array.isArray(entries)) {
      for (const entry of entries) {
        if (!entry.type || !entry.occurred_at) continue;

        const habitId = resolveHabitId(entry.habit);
        const practiceId = habitId ? resolvePracticeId(habitId, entry.practice) : null;
        const targetId = resolveTargetId(entry.target);

        // Check for duplicate (same type, habit, occurred_at)
        const existingR = await pool.query(
          `SELECT id FROM entries
           WHERE type = $1 AND occurred_at = $2
           AND COALESCE(habit_id, -1) = COALESCE($3, -1)`,
          [entry.type, entry.occurred_at, habitId]
        );
        if (existingR.rows.length > 0) {
          results.entries.skipped++;
          continue;
        }

        await pool.query(
          `INSERT INTO entries (type, habit_id, practice_id, target_id, occurred_at, duration_minutes, note, is_highlight, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            entry.type,
            habitId,
            practiceId,
            targetId,
            entry.occurred_at,
            entry.duration_minutes || null,
            entry.note || null,
            entry.is_highlight || false,
            entry.created_at || new Date(),
          ]
        );
        results.entries.inserted++;
      }
    }

    // Import preparations (both formats)
    const preparations = isFullExport ? data.preparations : data.preparations;
    if (Array.isArray(preparations)) {
      for (const prep of preparations) {
        const periodType = prep.period_type || 'day';
        const periodStart = prep.period_start || (isDayLog ? data.date : null);
        if (!periodStart) continue;

        // Check for duplicate
        const existingR = await pool.query(
          'SELECT id FROM preparations WHERE period_type = $1 AND period_start = $2',
          [periodType, periodStart]
        );
        if (existingR.rows.length > 0) {
          results.preparations.skipped++;
          continue;
        }

        const habitId = resolveHabitId(prep.habit);
        const practiceId = habitId ? resolvePracticeId(habitId, prep.practice) : null;
        const targetId = resolveTargetId(prep.target);

        await pool.query(
          `INSERT INTO preparations (period_type, period_start, occurred_at, note, habit_id, practice_id, target_id, rest_day, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            periodType,
            periodStart,
            prep.occurred_at || null,
            prep.note || null,
            habitId,
            practiceId,
            targetId,
            prep.rest_day || false,
            prep.created_at || new Date(),
          ]
        );
        results.preparations.inserted++;
      }
    }

    // Import closures (both formats)
    const closures = isFullExport ? data.closures : data.closures;
    if (Array.isArray(closures)) {
      for (const closure of closures) {
        if (!closure.occurred_at && !closure.scope) continue;

        const scope = closure.scope || 'day';
        const occurredAt = closure.occurred_at || (isDayLog ? `${data.date}T23:59:59` : null);
        if (!occurredAt) continue;

        // Check for duplicate
        const existingR = await pool.query(
          'SELECT id FROM closures WHERE scope = $1 AND occurred_at = $2',
          [scope, occurredAt]
        );
        if (existingR.rows.length > 0) {
          results.closures.skipped++;
          continue;
        }

        const habitId = resolveHabitId(closure.habit);
        const practiceId = habitId ? resolvePracticeId(habitId, closure.practice) : null;

        await pool.query(
          `INSERT INTO closures (scope, occurred_at, note, habit_id, practice_id, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [scope, occurredAt, closure.note || null, habitId, practiceId, closure.created_at || new Date()]
        );
        results.closures.inserted++;
      }
    }

    // Import reflections (both formats)
    const reflections = isFullExport ? data.reflections : data.reflections;
    if (Array.isArray(reflections)) {
      for (const reflection of reflections) {
        if (!reflection.note) continue;

        const habitId = resolveHabitId(reflection.habit);
        const targetId = resolveTargetId(reflection.target);

        // Check for duplicate (same note content and date - rough dedup)
        const createdAt = reflection.created_at || new Date();
        const existingR = await pool.query(
          `SELECT id FROM reflections WHERE note = $1 AND DATE(created_at) = DATE($2)`,
          [reflection.note, createdAt]
        );
        if (existingR.rows.length > 0) {
          results.reflections.skipped++;
          continue;
        }

        await pool.query(
          `INSERT INTO reflections (note, reflection_type, period_start, period_end, habit_id, target_id, triggers, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            reflection.note,
            reflection.reflection_type || 'adhoc',
            reflection.period_start || null,
            reflection.period_end || null,
            habitId,
            targetId,
            reflection.triggers ? JSON.stringify(reflection.triggers) : null,
            createdAt,
          ]
        );
        results.reflections.inserted++;
      }
    }

    res.json({ ok: true, results });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
