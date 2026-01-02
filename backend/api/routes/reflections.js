const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

// GET /reflections
router.get('/', async (_req, res, next) => {
  try {
    const r = await pool.query('SELECT * FROM reflections ORDER BY created_at DESC');
    res.json({ ok: true, reflections: r.rows });
  } catch (err) {
    next(err);
  }
});

// POST /reflections
router.post('/', async (req, res, next) => {
  try {
    const { type, period_start, period_end, content } = req.body || {};

    if (!type || !['weekly', 'monthly', 'ad_hoc'].includes(type)) {
      return res.status(400).json({ ok: false, error: "type must be 'weekly', 'monthly', or 'ad_hoc'" });
    }
    if (!content) return res.status(400).json({ ok: false, error: 'content is required' });

    const q = `
      INSERT INTO reflections (type, period_start, period_end, content)
      VALUES ($1, $2::date, $3::date, $4)
      RETURNING *;
    `;

    const r = await pool.query(q, [
      type,
      period_start ?? null,
      period_end ?? null,
      content,
    ]);

    res.status(201).json({ ok: true, reflection: r.rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
