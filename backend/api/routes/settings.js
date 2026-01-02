const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

// GET /settings
router.get('/', async (_req, res, next) => {
  try {
    const r = await pool.query('SELECT key, value, updated_at FROM settings ORDER BY key ASC');
    res.json({ ok: true, settings: r.rows });
  } catch (err) {
    next(err);
  }
});

// GET /settings/:key
router.get('/:key', async (req, res, next) => {
  try {
    const r = await pool.query('SELECT key, value, updated_at FROM settings WHERE key = $1', [req.params.key]);
    if (!r.rows[0]) return res.status(404).json({ ok: false, error: 'setting not found' });
    res.json({ ok: true, setting: r.rows[0] });
  } catch (err) {
    next(err);
  }
});

// PUT /settings/:key  (upsert)
router.put('/:key', async (req, res, next) => {
  try {
    const { key } = req.params;
    const value = req.body; // accept any JSON object/value

    const q = `
      INSERT INTO settings (key, value)
      VALUES ($1, $2::jsonb)
      ON CONFLICT (key)
      DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
      RETURNING key, value, updated_at;
    `;

    const r = await pool.query(q, [key, JSON.stringify(value)]);
    res.json({ ok: true, setting: r.rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
