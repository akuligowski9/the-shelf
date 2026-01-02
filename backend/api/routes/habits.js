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

module.exports = router;
