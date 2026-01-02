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

    q += ' ORDER BY updated_at DESC, name ASC';

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
    const { status, name, description, type } = req.body || {};

    // Allow partial updates, but validate if provided
    if (status && !['active', 'parked', 'planned', 'done', 'archived'].includes(status)) {
      return res.status(400).json({ ok: false, error: "status must be one of: active, parked, planned, done, archived" });
    }
    if (type && !['project', 'milestone', 'idea'].includes(type)) {
      return res.status(400).json({ ok: false, error: "type must be 'project', 'milestone', or 'idea'" });
    }

    const q = `
      UPDATE targets
      SET
        status = COALESCE($2, status),
        name = COALESCE($3, name),
        description = COALESCE($4, description),
        type = COALESCE($5, type)
      WHERE id = $1::uuid
      RETURNING *;
    `;

    const r = await pool.query(q, [
      id,
      status ?? null,
      name ?? null,
      description ?? null,
      type ?? null,
    ]);

    if (!r.rows[0]) return res.status(404).json({ ok: false, error: 'target not found' });

    res.json({ ok: true, target: r.rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
