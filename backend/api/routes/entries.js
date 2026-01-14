const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

function isoDayLocal(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

router.post('/', async (req, res, next) => {
  try {
    const {
      occurred_at,
      type,
      habit_id,
      practice_id,
      note,
      duration_minutes,
      target_id,
      source,
      is_highlight,
    } = req.body || {};

    if (!type || !['habit', 'life', 'caution'].includes(type)) {
      return res.status(400).json({ ok: false, error: "type must be 'habit', 'life', or 'caution'" });
    }

    // Habit entries require habit_id
    if (type === 'habit' && !habit_id) {
      return res.status(400).json({ ok: false, error: "habit_id is required when type='habit'" });
    }
    // Non-habit entries should not have habit_id
    if (type !== 'habit' && habit_id) {
      return res.status(400).json({ ok: false, error: "habit_id must be null for non-habit entries" });
    }

    const q = `
      INSERT INTO entries (
        occurred_at, type, habit_id, practice_id, note, duration_minutes,
        target_id, source, is_highlight
      )
      VALUES (
        COALESCE($1::timestamptz, NOW()),
        $2, $3, $4, $5, $6::int,
        $7,
        COALESCE($8, 'manual'),
        COALESCE($9, false)
      )
      RETURNING *;
    `;

    const params = [
      occurred_at || null,
      type,
      habit_id || null,
      practice_id || null,
      note || null,
      duration_minutes ?? null,
      target_id || null,
      source || null,
      is_highlight ?? null,
    ];

    const r = await pool.query(q, params);

    // Return entry with joined names
    const entryWithNames = await pool.query(`
      SELECT e.*, h.name as habit, h.color as habit_color, p.name as practice, t.name as target
      FROM entries e
      LEFT JOIN habits h ON e.habit_id = h.id
      LEFT JOIN practices p ON e.practice_id = p.id
      LEFT JOIN targets t ON e.target_id = t.id
      WHERE e.id = $1
    `, [r.rows[0].id]);

    res.status(201).json({ ok: true, entry: entryWithNames.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.get('/today', async (_req, res, next) => {
  try {
    const day = isoDayLocal();
    const q = `
      SELECT e.*, h.name as habit, h.color as habit_color, p.name as practice, t.name as target
      FROM entries e
      LEFT JOIN habits h ON e.habit_id = h.id
      LEFT JOIN practices p ON e.practice_id = p.id
      LEFT JOIN targets t ON e.target_id = t.id
      WHERE e.occurred_at >= ($1::date)
        AND e.occurred_at <  (($1::date) + INTERVAL '1 day')
      ORDER BY e.occurred_at DESC;
    `;
    const r = await pool.query(q, [day]);
    res.json({ ok: true, date: day, entries: r.rows });
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ ok: false, error: "Provide query params: from=YYYY-MM-DD&to=YYYY-MM-DD" });
    }

    const q = `
      SELECT e.*, h.name as habit, h.color as habit_color, p.name as practice, t.name as target
      FROM entries e
      LEFT JOIN habits h ON e.habit_id = h.id
      LEFT JOIN practices p ON e.practice_id = p.id
      LEFT JOIN targets t ON e.target_id = t.id
      WHERE e.occurred_at >= ($1::date)
        AND e.occurred_at <  (($2::date) + INTERVAL '1 day')
      ORDER BY e.occurred_at DESC;
    `;

    const r = await pool.query(q, [from, to]);
    res.json({ ok: true, from, to, entries: r.rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
