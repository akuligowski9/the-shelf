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
      practice,
      note,
      duration_minutes,
      target_id,
      program_id,
      source,
      is_highlight,
    } = req.body || {};

    if (!type || !['habit', 'life'].includes(type)) {
      return res.status(400).json({ ok: false, error: "type must be 'habit' or 'life'" });
    }
    if (!practice || typeof practice !== 'string') {
      return res.status(400).json({ ok: false, error: 'practice is required' });
    }

    // Let DB constraint enforce habit_id rules, but we can give nicer errors:
    if (type === 'habit' && !habit_id) {
      return res.status(400).json({ ok: false, error: "habit_id is required when type='habit'" });
    }
    if (type === 'life' && habit_id) {
      return res.status(400).json({ ok: false, error: "habit_id must be null when type='life'" });
    }

    const q = `
      INSERT INTO entries (
        occurred_at, type, habit_id, practice, note, duration_minutes,
        target_id, program_id, source, is_highlight
      )
      VALUES (
        COALESCE($1::timestamptz, NOW()),
        $2, $3::uuid, $4, $5, $6::int,
        $7::uuid, $8::uuid,
        COALESCE($9, 'manual'),
        COALESCE($10, false)
      )
      RETURNING *;
    `;

    const params = [
      occurred_at || null,
      type,
      habit_id || null,
      practice,
      note || null,
      duration_minutes ?? null,
      target_id || null,
      program_id || null,
      source || null,
      is_highlight ?? null,
    ];

    const r = await pool.query(q, params);
    res.status(201).json({ ok: true, entry: r.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.get('/today', async (_req, res, next) => {
  try {
    const day = isoDayLocal();
    const q = `
      SELECT *
      FROM entries
      WHERE occurred_at >= ($1::date)
        AND occurred_at <  (($1::date) + INTERVAL '1 day')
      ORDER BY occurred_at DESC;
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
      SELECT *
      FROM entries
      WHERE occurred_at >= ($1::date)
        AND occurred_at <  (($2::date) + INTERVAL '1 day')
      ORDER BY occurred_at DESC;
    `;

    const r = await pool.query(q, [from, to]);
    res.json({ ok: true, from, to, entries: r.rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
