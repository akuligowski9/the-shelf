const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query;

    let q = 'SELECT * FROM targets';
    const params = [];

    if (status) {
      q += ' WHERE status = $1';
      params.push(status);
    }

    q += ' ORDER BY COALESCE(sort_order, 9999), updated_at DESC, name ASC';

    const r = await pool.query(q, params);
    res.json({ ok: true, targets: r.rows });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { type, name, status, description } = req.body || {};

    if (!type || !['project', 'milestone', 'idea'].includes(type)) {
      return res.status(400).json({ ok: false, error: "type must be 'project', 'milestone', or 'idea'" });
    }
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ ok: false, error: 'name is required' });
    }
    if (!status || !['active', 'parked', 'planned', 'done', 'archived'].includes(status)) {
      return res.status(400).json({ ok: false, error: "status must be one of: active, parked, planned, done, archived" });
    }

    const q = `
      INSERT INTO targets (type, name, status, description)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const r = await pool.query(q, [type, name, status, description || null]);
    res.status(201).json({ ok: true, target: r.rows[0] });
  } catch (err) {
    next(err);
  }
});

// PATCH /targets/:id  (status changes + light edits)
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, name, description, type, start_date, end_date, planned_duration, habit_id } = req.body || {};

    // Allow partial updates, but validate if provided
    if (status && !['active', 'parked', 'planned', 'done', 'archived'].includes(status)) {
      return res.status(400).json({ ok: false, error: "status must be one of: active, parked, planned, done, archived" });
    }
    if (type && !['project', 'milestone', 'idea'].includes(type)) {
      return res.status(400).json({ ok: false, error: "type must be 'project', 'milestone', or 'idea'" });
    }

    // Build dynamic update - need this approach to allow setting dates to null
    const updates = [];
    const params = [id];
    let paramCount = 2;

    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      params.push(status);
    }
    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      params.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      params.push(description);
    }
    if (type !== undefined) {
      updates.push(`type = $${paramCount++}`);
      params.push(type);
    }
    if (start_date !== undefined) {
      updates.push(`start_date = $${paramCount++}::date`);
      params.push(start_date);
    }
    if (end_date !== undefined) {
      updates.push(`end_date = $${paramCount++}::date`);
      params.push(end_date);
    }
    if (planned_duration !== undefined) {
      updates.push(`planned_duration = $${paramCount++}`);
      params.push(planned_duration);
    }
    if (habit_id !== undefined) {
      updates.push(`habit_id = $${paramCount++}`);
      params.push(habit_id);
    }
    if (req.body.sort_order !== undefined) {
      updates.push(`sort_order = $${paramCount++}`);
      params.push(req.body.sort_order);
    }

    if (updates.length === 0) {
      return res.status(400).json({ ok: false, error: 'No fields to update' });
    }

    const q = `
      UPDATE targets
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $1      RETURNING *;
    `;

    const r = await pool.query(q, params);

    if (!r.rows[0]) return res.status(404).json({ ok: false, error: 'target not found' });

    res.json({ ok: true, target: r.rows[0] });
  } catch (err) {
    next(err);
  }
});

// PUT /targets/reorder - Bulk update sort_order for multiple targets
router.put('/reorder', async (req, res, next) => {
  try {
    const { target_ids } = req.body || {};

    if (!Array.isArray(target_ids) || target_ids.length === 0) {
      return res.status(400).json({ ok: false, error: 'target_ids array is required' });
    }

    // Update sort_order for each target based on array position
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (let i = 0; i < target_ids.length; i++) {
        await client.query(
          'UPDATE targets SET sort_order = $1, updated_at = NOW() WHERE id = $2',
          [i, target_ids[i]]
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    res.json({ ok: true, reordered: target_ids.length });
  } catch (err) {
    next(err);
  }
});

// DELETE /targets/:id - Delete a target
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const r = await pool.query('DELETE FROM targets WHERE id = $1 RETURNING id', [id]);

    if (r.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Target not found' });
    }

    res.json({ ok: true, deleted: id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
