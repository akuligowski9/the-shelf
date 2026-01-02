const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

function isoDayLocal(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

router.get('/today', async (_req, res, next) => {
  try {
    const day = isoDayLocal();

    const habitsQ = pool.query('SELECT * FROM habits ORDER BY COALESCE(sort_order, 9999), name ASC');

    const targetsQ = pool.query('SELECT * FROM targets ORDER BY updated_at DESC, name ASC');

    const entriesQ = pool.query(
      `
      SELECT *
      FROM entries
      WHERE occurred_at >= ($1::date)
        AND occurred_at <  (($1::date) + INTERVAL '1 day')
      ORDER BY occurred_at DESC;
      `,
      [day]
    );

    const highlightsQ = pool.query(
      `
      SELECT *
      FROM entries
      WHERE is_highlight = true
      ORDER BY occurred_at DESC
      LIMIT 25;
      `
    );

    const [habitsR, targetsR, entriesR, highlightsR] = await Promise.all([
      habitsQ, targetsQ, entriesQ, highlightsQ
    ]);

    // group targets by status (for shelf vs parking lot)
    const grouped = targetsR.rows.reduce((acc, t) => {
      acc[t.status] = acc[t.status] || [];
      acc[t.status].push(t);
      return acc;
    }, {});

    res.json({
      ok: true,
      date: day,
      habits: habitsR.rows,
      targets: grouped,
      entries: entriesR.rows,
      highlights: highlightsR.rows
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
