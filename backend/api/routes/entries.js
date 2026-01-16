const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

function isoDayLocal(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

router.post('/', async (req, res, next) => {
  try {
    const {
      occurred_at,
      type,
      habit_id,
      practice_id,
      note,
      actions,
      duration_minutes,
      target_id,
      source,
      is_highlight,
    } = req.body || {};

    if (!type || !['habit', 'life', 'caution'].includes(type)) {
      return res.status(400).json({ ok: false, error: "type must be 'habit', 'life', or 'caution'" });
    }

    // Habit entries require habit_id
    if (type === 'habit' && !habit_id) {
      return res.status(400).json({ ok: false, error: "habit_id is required when type='habit'" });
    }
    // Non-habit entries should not have habit_id
    if (type !== 'habit' && habit_id) {
      return res.status(400).json({ ok: false, error: "habit_id must be null for non-habit entries" });
    }

    // Validate duration_minutes is non-negative if provided
    if (duration_minutes !== undefined && duration_minutes !== null && duration_minutes < 0) {
      return res.status(400).json({ ok: false, error: "duration_minutes must be non-negative" });
    }

    const q = `
      INSERT INTO entries (
        occurred_at, type, habit_id, practice_id, note, actions, duration_minutes,
        target_id, source, is_highlight
      )
      VALUES (
        COALESCE($1::timestamptz, NOW()),
        $2, $3, $4, $5, $6::jsonb, $7::int,
        $8,
        COALESCE($9, 'manual'),
        COALESCE($10, false)
      )
      RETURNING *;
    `;

    const params = [
      occurred_at || null,
      type,
      habit_id || null,
      practice_id || null,
      note || null,
      actions ? JSON.stringify(actions) : null,
      duration_minutes ?? null,
      target_id || null,
      source || null,
      is_highlight ?? null,
    ];

    const r = await pool.query(q, params);

    // Return entry with joined names
    const entryWithNames = await pool.query(`
      SELECT e.*, h.name as habit, h.color as habit_color, p.name as practice, t.name as target
      FROM entries e
      LEFT JOIN habits h ON e.habit_id = h.id
      LEFT JOIN practices p ON e.practice_id = p.id
      LEFT JOIN targets t ON e.target_id = t.id
      WHERE e.id = $1
    `, [r.rows[0].id]);

    res.status(201).json({ ok: true, entry: entryWithNames.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.get('/today', async (_req, res, next) => {
  try {
    const day = isoDayLocal();
    const q = `
      SELECT e.*, h.name as habit, h.color as habit_color, p.name as practice, t.name as target
      FROM entries e
      LEFT JOIN habits h ON e.habit_id = h.id
      LEFT JOIN practices p ON e.practice_id = p.id
      LEFT JOIN targets t ON e.target_id = t.id
      WHERE e.occurred_at >= ($1::date)
        AND e.occurred_at <  (($1::date) + INTERVAL '1 day')
      ORDER BY e.occurred_at DESC;
    `;
    const r = await pool.query(q, [day]);
    res.json({ ok: true, date: day, entries: r.rows });
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ ok: false, error: "Provide query params: from=YYYY-MM-DD&to=YYYY-MM-DD" });
    }

    // Validate date range
    if (new Date(from) > new Date(to)) {
      return res.status(400).json({ ok: false, error: 'from date must be before or equal to to date' });
    }

    const q = `
      SELECT e.*, h.name as habit, h.color as habit_color, p.name as practice, t.name as target
      FROM entries e
      LEFT JOIN habits h ON e.habit_id = h.id
      LEFT JOIN practices p ON e.practice_id = p.id
      LEFT JOIN targets t ON e.target_id = t.id
      WHERE e.occurred_at >= ($1::date)
        AND e.occurred_at <  (($2::date) + INTERVAL '1 day')
      ORDER BY e.occurred_at DESC;
    `;

    const r = await pool.query(q, [from, to]);
    res.json({ ok: true, from, to, entries: r.rows });
  } catch (err) {
    next(err);
  }
});

// PUT /entries/:id - Update an entry
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      occurred_at,
      type,
      habit_id,
      practice_id,
      note,
      actions,
      duration_minutes,
      target_id,
      is_highlight,
      warm_up_note,
      cool_down_note,
      archived_at,
    } = req.body || {};

    // Validate type if provided
    if (type && !['habit', 'life', 'caution'].includes(type)) {
      return res.status(400).json({ ok: false, error: "type must be 'habit', 'life', or 'caution'" });
    }

    // Build dynamic update query
    const updates = [];
    const params = [];
    let paramCount = 1;

    if (occurred_at !== undefined) {
      updates.push(`occurred_at = $${paramCount}::timestamptz`);
      params.push(occurred_at);
      paramCount++;
    }
    if (type !== undefined) {
      updates.push(`type = $${paramCount}`);
      params.push(type);
      paramCount++;
    }
    if (habit_id !== undefined) {
      updates.push(`habit_id = $${paramCount}`);
      params.push(habit_id || null);
      paramCount++;
    }
    if (practice_id !== undefined) {
      updates.push(`practice_id = $${paramCount}`);
      params.push(practice_id || null);
      paramCount++;
    }
    if (note !== undefined) {
      updates.push(`note = $${paramCount}`);
      params.push(note || null);
      paramCount++;
    }
    if (actions !== undefined) {
      updates.push(`actions = $${paramCount}::jsonb`);
      params.push(actions ? JSON.stringify(actions) : null);
      paramCount++;
    }
    if (duration_minutes !== undefined) {
      updates.push(`duration_minutes = $${paramCount}::int`);
      params.push(duration_minutes);
      paramCount++;
    }
    if (target_id !== undefined) {
      updates.push(`target_id = $${paramCount}`);
      params.push(target_id || null);
      paramCount++;
    }
    if (is_highlight !== undefined) {
      updates.push(`is_highlight = $${paramCount}`);
      params.push(is_highlight);
      paramCount++;
    }
    if (warm_up_note !== undefined) {
      updates.push(`warm_up_note = $${paramCount}`);
      params.push(warm_up_note || null);
      paramCount++;
    }
    if (cool_down_note !== undefined) {
      updates.push(`cool_down_note = $${paramCount}`);
      params.push(cool_down_note || null);
      paramCount++;
    }
    if (archived_at !== undefined) {
      updates.push(`archived_at = $${paramCount}::timestamptz`);
      params.push(archived_at || null);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ ok: false, error: 'No fields to update' });
    }

    params.push(id);
    const q = `
      UPDATE entries
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *;
    `;

    const r = await pool.query(q, params);

    if (r.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Entry not found' });
    }

    // Return entry with joined names
    const entryWithNames = await pool.query(`
      SELECT e.*, h.name as habit, h.color as habit_color, p.name as practice, t.name as target
      FROM entries e
      LEFT JOIN habits h ON e.habit_id = h.id
      LEFT JOIN practices p ON e.practice_id = p.id
      LEFT JOIN targets t ON e.target_id = t.id
      WHERE e.id = $1
    `, [id]);

    res.json({ ok: true, entry: entryWithNames.rows[0] });
  } catch (err) {
    next(err);
  }
});

// DELETE /entries/:id - Delete an entry
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const r = await pool.query('DELETE FROM entries WHERE id = $1 RETURNING id', [id]);

    if (r.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Entry not found' });
    }

    res.json({ ok: true, deleted: id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
