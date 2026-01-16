const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

// GET /reflections - List reflections with optional filters
// Query params: from, to, habit_id, entry_id, type
router.get('/', async (req, res, next) => {
  try {
    const { from, to, habit_id, entry_id, type } = req.query;

    let conditions = [];
    let params = [];
    let paramCount = 1;

    if (from && to) {
      // Validate date range
      if (new Date(from) > new Date(to)) {
        return res.status(400).json({ ok: false, error: 'from date must be before or equal to to date' });
      }
      conditions.push(`(period_start >= $${paramCount}::date AND period_end <= $${paramCount + 1}::date)`);
      params.push(from, to);
      paramCount += 2;
    }

    if (habit_id) {
      conditions.push(`r.habit_id = $${paramCount}`);
      params.push(habit_id);
      paramCount++;
    }

    if (entry_id) {
      conditions.push(`r.entry_id = $${paramCount}`);
      params.push(entry_id);
      paramCount++;
    }

    if (type) {
      conditions.push(`r.reflection_type = $${paramCount}`);
      params.push(type);
      paramCount++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const q = `
      SELECT r.*,
        h.name as habit_name,
        h.color as habit_color,
        t.name as target_name,
        e.note as entry_note,
        e.type as entry_type,
        e.is_highlight as entry_is_highlight,
        eh.name as entry_habit_name
      FROM reflections r
      LEFT JOIN habits h ON r.habit_id = h.id
      LEFT JOIN targets t ON r.target_id = t.id
      LEFT JOIN entries e ON r.entry_id = e.id
      LEFT JOIN habits eh ON e.habit_id = eh.id
      ${whereClause}
      ORDER BY r.created_at DESC
    `;

    const result = await pool.query(q, params);
    res.json({ ok: true, reflections: result.rows });
  } catch (err) {
    next(err);
  }
});

// GET /reflections/:id - Get single reflection with context
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const q = `
      SELECT r.*,
        h.name as habit_name,
        h.color as habit_color,
        t.name as target_name,
        e.note as entry_note,
        e.type as entry_type,
        e.is_highlight as entry_is_highlight,
        eh.name as entry_habit_name
      FROM reflections r
      LEFT JOIN habits h ON r.habit_id = h.id
      LEFT JOIN targets t ON r.target_id = t.id
      LEFT JOIN entries e ON r.entry_id = e.id
      LEFT JOIN habits eh ON e.habit_id = eh.id
      WHERE r.id = $1
    `;

    const result = await pool.query(q, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Reflection not found' });
    }

    res.json({ ok: true, reflection: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// POST /reflections - Create a reflection
router.post('/', async (req, res, next) => {
  try {
    const { type, period_start, period_end, habit_id, target_id, entry_id, note, trigger_label, trigger_value } = req.body || {};

    if (!note) {
      return res.status(400).json({ ok: false, error: 'note is required' });
    }

    // Validate type
    const validTypes = ['day', 'weekly', 'monthly', 'habit', 'entry', 'target', 'adhoc'];
    const reflectionType = type || 'adhoc';
    if (!validTypes.includes(reflectionType)) {
      return res.status(400).json({ ok: false, error: `type must be one of: ${validTypes.join(', ')}` });
    }

    // Entry reflections don't need period
    if (reflectionType !== 'adhoc' && reflectionType !== 'entry') {
      if (!period_start || !period_end) {
        return res.status(400).json({ ok: false, error: 'period_start and period_end required for this type' });
      }
      // Validate period_start <= period_end
      if (new Date(period_start) > new Date(period_end)) {
        return res.status(400).json({ ok: false, error: 'period_start must be before or equal to period_end' });
      }
    }

    const q = `
      INSERT INTO reflections (reflection_type, period_start, period_end, habit_id, target_id, entry_id, note, trigger_label, trigger_value)
      VALUES ($1, $2::date, $3::date, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await pool.query(q, [
      reflectionType,
      period_start || null,
      period_end || null,
      habit_id || null,
      target_id || null,
      entry_id || null,
      note,
      trigger_label || null,
      trigger_value || null,
    ]);

    res.status(201).json({ ok: true, reflection: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// PUT /reflections/:id - Update a reflection
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note } = req.body || {};

    if (!note) {
      return res.status(400).json({ ok: false, error: 'note is required' });
    }

    const q = `
      UPDATE reflections SET note = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(q, [note, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Reflection not found' });
    }

    res.json({ ok: true, reflection: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// DELETE /reflections/:id - Delete a reflection
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM reflections WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Reflection not found' });
    }

    res.json({ ok: true, deleted: id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
