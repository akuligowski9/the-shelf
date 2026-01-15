const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const pool = require('../db/pool');

const router = express.Router();

// Data directories
const DATA_DIR = path.join(__dirname, '../../../data');
const IMPORTS_DIR = path.join(DATA_DIR, 'imports');
const LOGS_DIR = path.join(DATA_DIR, 'logs');

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

/**
 * GET /data/pending
 * List files in data/imports/ waiting to be imported
 */
router.get('/pending', async (req, res, next) => {
  try {
    const files = await fs.readdir(IMPORTS_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json')).sort();
    res.json({ ok: true, files: jsonFiles });
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.json({ ok: true, files: [] });
    }
    next(err);
  }
});

/**
 * POST /data/preview-file
 * Preview what would be imported from a file (without actually importing)
 */
router.post('/preview-file', async (req, res, next) => {
  const { filename } = req.body;

  if (!filename) {
    return res.status(400).json({ ok: false, error: 'filename is required' });
  }

  if (!filename.endsWith('.json') || filename.includes('/') || filename.includes('..')) {
    return res.status(400).json({ ok: false, error: 'Invalid filename' });
  }

  const sourcePath = path.join(IMPORTS_DIR, filename);

  try {
    const content = await fs.readFile(sourcePath, 'utf-8');
    const data = JSON.parse(content);

    const isFullExport = data.version !== undefined;
    const isDayLog = data.date !== undefined;

    if (!isFullExport && !isDayLog) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid import format. Must have either "version" or "date".',
      });
    }

    // Build lookup maps
    const habitsR = await pool.query('SELECT id, name FROM habits');
    const habitMap = new Map(habitsR.rows.map(h => [h.name.toLowerCase(), h.id]));
    const habitIdToName = new Map(habitsR.rows.map(h => [h.id, h.name]));

    const practicesR = await pool.query('SELECT id, name, habit_id FROM practices');
    const practiceMap = new Map();
    practicesR.rows.forEach(p => {
      practiceMap.set(`${p.habit_id}:${p.name.toLowerCase()}`, p.id);
    });

    const targetsR = await pool.query('SELECT id, name FROM targets');
    const targetMap = new Map(targetsR.rows.map(t => [t.name.toLowerCase(), t.id]));

    const resolveHabitId = (habitName) => {
      if (!habitName) return null;
      return habitMap.get(habitName.toLowerCase()) || null;
    };

    const preview = {
      filename,
      date: data.date,
      entries: { will_insert: [], will_skip: [] },
      preparations: { will_insert: [], will_skip: [] },
      closures: { will_insert: [], will_skip: [] },
      reflections: { will_insert: [], will_skip: [] },
    };

    // Preview entries
    if (Array.isArray(data.entries)) {
      for (const entry of data.entries) {
        if (!entry.type || !entry.occurred_at) continue;

        const habitId = resolveHabitId(entry.habit);
        const existingR = await pool.query(
          `SELECT id FROM entries
           WHERE type = $1 AND occurred_at = $2
           AND COALESCE(habit_id, -1) = COALESCE($3, -1)`,
          [entry.type, entry.occurred_at, habitId]
        );

        const entryPreview = {
          type: entry.type,
          habit: entry.habit || null,
          occurred_at: entry.occurred_at,
          duration_minutes: entry.duration_minutes || null,
          note: entry.note ? (entry.note.length > 50 ? entry.note.slice(0, 50) + '...' : entry.note) : null,
        };

        if (existingR.rows.length > 0) {
          preview.entries.will_skip.push({ ...entryPreview, reason: 'duplicate' });
        } else if (entry.type === 'habit' && !habitId) {
          preview.entries.will_skip.push({ ...entryPreview, reason: 'unknown habit' });
        } else {
          preview.entries.will_insert.push(entryPreview);
        }
      }
    }

    // Preview preparations
    if (Array.isArray(data.preparations)) {
      for (const prep of data.preparations) {
        const periodType = prep.period_type || 'day';
        const periodStart = prep.period_start || (isDayLog ? data.date : null);
        if (!periodStart) continue;

        const existingR = await pool.query(
          'SELECT id FROM preparations WHERE period_type = $1 AND period_start = $2',
          [periodType, periodStart]
        );

        const prepPreview = {
          period_type: periodType,
          period_start: periodStart,
          note: prep.note ? (prep.note.length > 50 ? prep.note.slice(0, 50) + '...' : prep.note) : null,
        };

        if (existingR.rows.length > 0) {
          preview.preparations.will_skip.push({ ...prepPreview, reason: 'duplicate' });
        } else {
          preview.preparations.will_insert.push(prepPreview);
        }
      }
    }

    // Preview closures
    if (Array.isArray(data.closures)) {
      for (const closure of data.closures) {
        const scope = closure.scope || 'day';
        const occurredAt = closure.occurred_at || (isDayLog ? `${data.date}T23:59:59` : null);
        if (!occurredAt) continue;

        const existingR = await pool.query(
          'SELECT id FROM closures WHERE scope = $1 AND occurred_at = $2',
          [scope, occurredAt]
        );

        const closurePreview = {
          scope,
          occurred_at: occurredAt,
          note: closure.note ? (closure.note.length > 50 ? closure.note.slice(0, 50) + '...' : closure.note) : null,
        };

        if (existingR.rows.length > 0) {
          preview.closures.will_skip.push({ ...closurePreview, reason: 'duplicate' });
        } else {
          preview.closures.will_insert.push(closurePreview);
        }
      }
    }

    // Preview reflections
    if (Array.isArray(data.reflections)) {
      for (const reflection of data.reflections) {
        if (!reflection.note) continue;

        const createdAt = reflection.created_at || new Date().toISOString();
        const existingR = await pool.query(
          `SELECT id FROM reflections WHERE note = $1 AND DATE(created_at) = DATE($2)`,
          [reflection.note, createdAt]
        );

        const reflectionPreview = {
          note: reflection.note.length > 50 ? reflection.note.slice(0, 50) + '...' : reflection.note,
          reflection_type: reflection.reflection_type || 'adhoc',
        };

        if (existingR.rows.length > 0) {
          preview.reflections.will_skip.push({ ...reflectionPreview, reason: 'duplicate' });
        } else {
          preview.reflections.will_insert.push(reflectionPreview);
        }
      }
    }

    // Summary counts
    preview.summary = {
      entries: { insert: preview.entries.will_insert.length, skip: preview.entries.will_skip.length },
      preparations: { insert: preview.preparations.will_insert.length, skip: preview.preparations.will_skip.length },
      closures: { insert: preview.closures.will_insert.length, skip: preview.closures.will_skip.length },
      reflections: { insert: preview.reflections.will_insert.length, skip: preview.reflections.will_skip.length },
    };

    res.json({ ok: true, preview });
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).json({ ok: false, error: `File not found: ${filename}` });
    }
    next(err);
  }
});

/**
 * POST /data/import-file
 * Import a specific file from data/imports/ and move it to data/logs/
 */
router.post('/import-file', async (req, res, next) => {
  const { filename } = req.body;

  if (!filename) {
    return res.status(400).json({ ok: false, error: 'filename is required' });
  }

  // Security: only allow .json files, no path traversal
  if (!filename.endsWith('.json') || filename.includes('/') || filename.includes('..')) {
    return res.status(400).json({ ok: false, error: 'Invalid filename' });
  }

  const sourcePath = path.join(IMPORTS_DIR, filename);
  const destPath = path.join(LOGS_DIR, filename);

  try {
    // Read the file
    const content = await fs.readFile(sourcePath, 'utf-8');
    const data = JSON.parse(content);

    // Forward to the import handler by making internal request
    // For simplicity, we'll just call the same import logic
    // This duplicates some code but keeps it simple

    const results = {
      entries: { inserted: 0, skipped: 0 },
      preparations: { inserted: 0, skipped: 0 },
      closures: { inserted: 0, skipped: 0 },
      reflections: { inserted: 0, skipped: 0 },
    };

    // Determine format
    const isFullExport = data.version !== undefined;
    const isDayLog = data.date !== undefined;

    if (!isFullExport && !isDayLog) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid import format in file. Must have either "version" or "date".',
      });
    }

    // Build lookup maps
    const habitsR = await pool.query('SELECT id, name FROM habits');
    const habitMap = new Map(habitsR.rows.map(h => [h.name.toLowerCase(), h.id]));

    const practicesR = await pool.query('SELECT id, name, habit_id FROM practices');
    const practiceMap = new Map();
    practicesR.rows.forEach(p => {
      practiceMap.set(`${p.habit_id}:${p.name.toLowerCase()}`, p.id);
    });

    const targetsR = await pool.query('SELECT id, name FROM targets');
    const targetMap = new Map(targetsR.rows.map(t => [t.name.toLowerCase(), t.id]));

    const resolveHabitId = (habitName) => {
      if (!habitName) return null;
      return habitMap.get(habitName.toLowerCase()) || null;
    };

    const resolvePracticeId = (habitId, practiceName) => {
      if (!habitId || !practiceName) return null;
      return practiceMap.get(`${habitId}:${practiceName.toLowerCase()}`) || null;
    };

    const resolveTargetId = (targetName) => {
      if (!targetName) return null;
      return targetMap.get(targetName.toLowerCase()) || null;
    };

    // Import entries
    if (Array.isArray(data.entries)) {
      for (const entry of data.entries) {
        if (!entry.type || !entry.occurred_at) continue;

        const habitId = resolveHabitId(entry.habit);
        const practiceId = habitId ? resolvePracticeId(habitId, entry.practice) : null;
        const targetId = resolveTargetId(entry.target);

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

    // Import preparations
    if (Array.isArray(data.preparations)) {
      for (const prep of data.preparations) {
        const periodType = prep.period_type || 'day';
        const periodStart = prep.period_start || (isDayLog ? data.date : null);
        if (!periodStart) continue;

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
          [periodType, periodStart, prep.occurred_at || null, prep.note || null, habitId, practiceId, targetId, prep.rest_day || false, prep.created_at || new Date()]
        );
        results.preparations.inserted++;
      }
    }

    // Import closures
    if (Array.isArray(data.closures)) {
      for (const closure of data.closures) {
        const scope = closure.scope || 'day';
        const occurredAt = closure.occurred_at || (isDayLog ? `${data.date}T23:59:59` : null);
        if (!occurredAt) continue;

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

    // Import reflections
    if (Array.isArray(data.reflections)) {
      for (const reflection of data.reflections) {
        if (!reflection.note) continue;

        const habitId = resolveHabitId(reflection.habit);
        const targetId = resolveTargetId(reflection.target);
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

    // Move file to logs/
    await fs.rename(sourcePath, destPath);

    res.json({ ok: true, filename, moved_to: `logs/${filename}`, results });
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).json({ ok: false, error: `File not found: ${filename}` });
    }
    next(err);
  }
});

module.exports = router;
