const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

// GET /programs
router.get('/', async (_req, res, next) => {
  try {
    const r = await pool.query('SELECT * FROM programs ORDER BY start_date DESC, created_at DESC');
    res.json({ ok: true, programs: r.rows });
  } catch (err) {
    next(err);
  }
});

// POST /programs
router.post('/', async (req, res, next) => {
  try {
    const { name, status, start_date, end_date, habit_id, target_id, notes } = req.body || {};

    if (!name) return res.status(400).json({ ok: false, error: 'name is required' });
    if (!start_date) return res.status(400).json({ ok: false, error: 'start_date is required (YYYY-MM-DD)' });

    const q = `
      INSERT INTO programs (name, status, start_date, end_date, habit_id, target_id, notes)
      VALUES (
        $1,
        COALESCE($2, 'active'),
        $3::date,
        $4::date,
        $5::uuid,
        $6::uuid,
        $7
      )
      RETURNING *;
    `;

    const r = await pool.query(q, [
      name,
      status ?? null,
      start_date,
      end_date ?? null,
      habit_id ?? null,
      target_id ?? null,
      notes ?? null,
    ]);

    res.status(201).json({ ok: true, program: r.rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
