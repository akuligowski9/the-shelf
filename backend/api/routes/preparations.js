const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

// GET /preparations?period_type=day|week&period_start=YYYY-MM-DD
router.get('/', async (req, res, next) => {
  try {
    const { period_type, period_start } = req.query;

    if (!period_type || !['day', 'week'].includes(period_type)) {
      return res.status(400).json({ ok: false, error: "period_type must be 'day' or 'week'" });
    }
    if (!period_start) {
      return res.status(400).json({ ok: false, error: 'period_start is required (YYYY-MM-DD)' });
    }

    const r = await pool.query(
      'SELECT * FROM preparations WHERE period_type = $1 AND period_start = $2::date',
      [period_type, period_start]
    );

    res.json({ ok: true, preparation: r.rows[0] || null });
  } catch (err) {
    next(err);
  }
});

// PUT /preparations  (upsert)
router.put('/', async (req, res, next) => {
  try {
    const { period_type, period_start, note } = req.body || {};

    if (!period_type || !['day', 'week'].includes(period_type)) {
      return res.status(400).json({ ok: false, error: "period_type must be 'day' or 'week'" });
    }
    if (!period_start) return res.status(400).json({ ok: false, error: 'period_start is required (YYYY-MM-DD)' });
    if (!note) return res.status(400).json({ ok: false, error: 'note is required' });

    const q = `
      INSERT INTO preparations (period_type, period_start, note)
      VALUES ($1, $2::date, $3)
      ON CONFLICT (period_type, period_start)
      DO UPDATE SET note = EXCLUDED.note, updated_at = NOW()
      RETURNING *;
    `;

    const r = await pool.query(q, [period_type, period_start, note]);
    res.json({ ok: true, preparation: r.rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
