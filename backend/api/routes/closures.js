const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

// GET /closures?scope=day&date=YYYY-MM-DD (single day)
// GET /closures?scope=day&from=YYYY-MM-DD&to=YYYY-MM-DD (range query)
router.get('/', async (req, res, next) => {
  try {
    const { scope, date, from, to } = req.query;

    if (!scope || !['day', 'session'].includes(scope)) {
      return res.status(400).json({ ok: false, error: "scope must be 'day' or 'session'" });
    }

    // Range query
    if (from && to) {
      const r = await pool.query(
        `SELECT * FROM closures
         WHERE scope = $1
           AND occurred_at >= ($2::date)::timestamp AT TIME ZONE 'America/New_York'
           AND occurred_at < (($3::date + INTERVAL '1 day'))::timestamp AT TIME ZONE 'America/New_York'
         ORDER BY occurred_at ASC`,
        [scope, from, to]
      );
      return res.json({ ok: true, closures: r.rows });
    }

    // Single day query
    if (!date) {
      return res.status(400).json({ ok: false, error: 'date or from/to range is required' });
    }

    const r = await pool.query(
      `SELECT * FROM closures
       WHERE scope = $1
         AND occurred_at >= ($2::date)::timestamp AT TIME ZONE 'America/New_York'
         AND occurred_at < (($2::date + INTERVAL '1 day'))::timestamp AT TIME ZONE 'America/New_York'
       ORDER BY occurred_at DESC
       LIMIT 1`,
      [scope, date]
    );

    res.json({ ok: true, closure: r.rows[0] || null });
  } catch (err) {
    next(err);
  }
});

// PUT /closures  (upsert for day scope)
router.put('/', async (req, res, next) => {
  try {
    const { scope, occurred_at, note } = req.body || {};

    if (!scope || !['day', 'session'].includes(scope)) {
      return res.status(400).json({ ok: false, error: "scope must be 'day' or 'session'" });
    }
    if (!occurred_at) {
      return res.status(400).json({ ok: false, error: 'occurred_at is required' });
    }

    // Extract date from occurred_at for upsert logic
    const date = occurred_at.split('T')[0];

    // For day scope, upsert based on date
    // First check if one exists for this day
    const existing = await pool.query(
      `SELECT id FROM closures
       WHERE scope = $1
         AND occurred_at >= ($2::date)::timestamp AT TIME ZONE 'America/New_York'
         AND occurred_at < (($2::date + INTERVAL '1 day'))::timestamp AT TIME ZONE 'America/New_York'`,
      [scope, date]
    );

    let result;
    if (existing.rows.length > 0) {
      // Update existing
      result = await pool.query(
        `UPDATE closures
         SET note = $1, occurred_at = $2::timestamptz, updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [note || null, occurred_at, existing.rows[0].id]
      );
    } else {
      // Insert new
      result = await pool.query(
        `INSERT INTO closures (scope, occurred_at, note)
         VALUES ($1, $2::timestamptz, $3)
         RETURNING *`,
        [scope, occurred_at, note || null]
      );
    }

    res.json({ ok: true, closure: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
