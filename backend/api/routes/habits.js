const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const r = await pool.query(
      'SELECT * FROM habits ORDER BY COALESCE(sort_order, 9999), name ASC'
    );
    res.json({ ok: true, habits: r.rows });
  } catch (err) {
    next(err);
  }
});

// Get all practices
router.get('/practices', async (_req, res, next) => {
  try {
    const r = await pool.query(
      'SELECT * FROM practices ORDER BY habit_id, COALESCE(sort_order, 9999), name ASC'
    );
    res.json({ ok: true, practices: r.rows });
  } catch (err) {
    next(err);
  }
});

// POST /habits/practices - Create a practice
router.post('/practices', async (req, res, next) => {
  try {
    const { habit_id, name, active, details, sort_order } = req.body || {};

    if (!habit_id) {
      return res.status(400).json({ ok: false, error: 'habit_id is required' });
    }
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ ok: false, error: 'name is required' });
    }

    const q = `
      INSERT INTO practices (habit_id, name, active, details, sort_order)
      VALUES ($1, $2, COALESCE($3, true), $4, $5)
      RETURNING *;
    `;
    const r = await pool.query(q, [
      habit_id,
      name,
      active ?? null,
      details ?? null,
      sort_order ?? null,
    ]);

    res.status(201).json({ ok: true, practice: r.rows[0] });
  } catch (err) {
    next(err);
  }
});

// PUT /habits/practices/:id - Update a practice
router.put('/practices/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, active, details, sort_order } = req.body || {};

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      params.push(name);
    }
    if (active !== undefined) {
      updates.push(`active = $${paramCount++}`);
      params.push(active);
    }
    if (details !== undefined) {
      updates.push(`details = $${paramCount++}`);
      params.push(details);
    }
    if (sort_order !== undefined) {
      updates.push(`sort_order = $${paramCount++}`);
      params.push(sort_order);
    }

    if (updates.length === 0) {
      return res.status(400).json({ ok: false, error: 'No fields to update' });
    }

    params.push(id);
    const q = `
      UPDATE practices
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *;
    `;

    const r = await pool.query(q, params);

    if (r.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Practice not found' });
    }

    res.json({ ok: true, practice: r.rows[0] });
  } catch (err) {
    next(err);
  }
});

// DELETE /habits/practices/:id - Delete a practice
router.delete('/practices/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const r = await pool.query('DELETE FROM practices WHERE id = $1 RETURNING id', [id]);

    if (r.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Practice not found' });
    }

    res.json({ ok: true, deleted: id });
  } catch (err) {
    next(err);
  }
});

// Get all actions
router.get('/actions', async (_req, res, next) => {
  try {
    const r = await pool.query(
      'SELECT * FROM actions ORDER BY practice_id, name ASC'
    );
    res.json({ ok: true, actions: r.rows });
  } catch (err) {
    next(err);
  }
});

// POST /habits/actions - Create an action
router.post('/actions', async (req, res, next) => {
  try {
    const { practice_id, name, active } = req.body || {};

    if (!practice_id) {
      return res.status(400).json({ ok: false, error: 'practice_id is required' });
    }
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ ok: false, error: 'name is required' });
    }

    const q = `
      INSERT INTO actions (practice_id, name, active)
      VALUES ($1, $2, COALESCE($3, true))
      RETURNING *;
    `;
    const r = await pool.query(q, [practice_id, name, active ?? null]);

    res.status(201).json({ ok: true, action: r.rows[0] });
  } catch (err) {
    next(err);
  }
});

// PUT /habits/actions/:id - Update an action
router.put('/actions/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, active } = req.body || {};

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      params.push(name);
    }
    if (active !== undefined) {
      updates.push(`active = $${paramCount++}`);
      params.push(active);
    }

    if (updates.length === 0) {
      return res.status(400).json({ ok: false, error: 'No fields to update' });
    }

    params.push(id);
    const q = `
      UPDATE actions
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *;
    `;

    const r = await pool.query(q, params);

    if (r.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Action not found' });
    }

    res.json({ ok: true, action: r.rows[0] });
  } catch (err) {
    next(err);
  }
});

// DELETE /habits/actions/:id - Delete an action
router.delete('/actions/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const r = await pool.query('DELETE FROM actions WHERE id = $1 RETURNING id', [id]);

    if (r.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Action not found' });
    }

    res.json({ ok: true, deleted: id });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, target_minutes, active, sort_order } = req.body || {};
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ ok: false, error: 'name is required' });
    }

    const q = `
      INSERT INTO habits (name, target_minutes, active, sort_order)
      VALUES ($1, COALESCE($2, 60), COALESCE($3, true), $4)
      RETURNING *;
    `;
    const r = await pool.query(q, [
      name,
      target_minutes ?? null,
      active ?? null,
      sort_order ?? null,
    ]);

    res.status(201).json({ ok: true, habit: r.rows[0] });
  } catch (err) {
    next(err);
  }
});

// PUT /habits/:id - Update a habit
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, target_minutes, active, sort_order, color, track_actions } = req.body || {};

    // Build dynamic update query
    const updates = [];
    const params = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      params.push(name);
    }
    if (target_minutes !== undefined) {
      updates.push(`target_minutes = $${paramCount++}`);
      params.push(target_minutes);
    }
    if (active !== undefined) {
      updates.push(`active = $${paramCount++}`);
      params.push(active);
    }
    if (sort_order !== undefined) {
      updates.push(`sort_order = $${paramCount++}`);
      params.push(sort_order);
    }
    if (color !== undefined) {
      updates.push(`color = $${paramCount++}`);
      params.push(color);
    }
    if (track_actions !== undefined) {
      updates.push(`track_actions = $${paramCount++}`);
      params.push(track_actions);
    }

    if (updates.length === 0) {
      return res.status(400).json({ ok: false, error: 'No fields to update' });
    }

    params.push(id);
    const q = `
      UPDATE habits
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *;
    `;

    const r = await pool.query(q, params);

    if (r.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Habit not found' });
    }

    res.json({ ok: true, habit: r.rows[0] });
  } catch (err) {
    next(err);
  }
});

// DELETE /habits/:id - Delete a habit
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const r = await pool.query('DELETE FROM habits WHERE id = $1 RETURNING id', [id]);

    if (r.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Habit not found' });
    }

    res.json({ ok: true, deleted: id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
