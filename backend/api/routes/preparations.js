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
    const { period_type, period_start, note, rest_day } = req.body || {};

    if (!period_type || !['day', 'week'].includes(period_type)) {
      return res.status(400).json({ ok: false, error: "period_type must be 'day' or 'week'" });
    }
    if (!period_start) return res.status(400).json({ ok: false, error: 'period_start is required (YYYY-MM-DD)' });

    const q = `
      INSERT INTO preparations (period_type, period_start, note, rest_day)
      VALUES ($1, $2::date, $3, COALESCE($4, false))
      ON CONFLICT (period_type, period_start)
      DO UPDATE SET note = EXCLUDED.note, rest_day = EXCLUDED.rest_day, updated_at = NOW()
      RETURNING *;
    `;

    const r = await pool.query(q, [period_type, period_start, note || null, rest_day]);
    res.json({ ok: true, preparation: r.rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
