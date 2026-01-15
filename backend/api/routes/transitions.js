const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

// GET /transitions - Get habit transitions (most recent first)
router.get('/', async (req, res, next) => {
  try {
    const { limit = 15 } = req.query;

    const q = `
      SELECT *
      FROM habit_transitions
      ORDER BY ended_at DESC
      LIMIT $1
    `;
    const r = await pool.query(q, [parseInt(limit, 10)]);
    res.json({ ok: true, transitions: r.rows });
  } catch (err) {
    next(err);
  }
});

// POST /transitions - Create a new habit transition
router.post('/', async (req, res, next) => {
  try {
    const { started_at, ended_at, note, changes, cascades } = req.body || {};

    if (!started_at || !ended_at) {
      return res.status(400).json({ ok: false, error: 'started_at and ended_at are required' });
    }

    const q = `
      INSERT INTO habit_transitions (started_at, ended_at, note, changes, cascades)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const r = await pool.query(q, [
      started_at,
      ended_at,
      note || null,
      JSON.stringify(changes || []),
      JSON.stringify(cascades || {}),
    ]);

    res.status(201).json({ ok: true, transition: r.rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
