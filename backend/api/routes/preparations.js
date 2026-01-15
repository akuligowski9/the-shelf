const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

// GET /preparations?period_type=day|week&period_start=YYYY-MM-DD
// GET /preparations?period_type=day|week&from=YYYY-MM-DD&to=YYYY-MM-DD (range query)
router.get('/', async (req, res, next) => {
  try {
    const { period_type, period_start, from, to } = req.query;

    if (!period_type || !['day', 'week'].includes(period_type)) {
      return res.status(400).json({ ok: false, error: "period_type must be 'day' or 'week'" });
    }

    // Range query
    if (from && to) {
      const r = await pool.query(
        `SELECT * FROM preparations
         WHERE period_type = $1 AND period_start >= $2::date AND period_start <= $3::date
         ORDER BY period_start ASC`,
        [period_type, from, to]
      );
      return res.json({ ok: true, preparations: r.rows });
    }

    // Single day query
    if (!period_start) {
      return res.status(400).json({ ok: false, error: 'period_start or from/to range is required' });
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
