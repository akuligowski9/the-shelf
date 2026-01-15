const express = require('express');
const { getWeeklyMetrics, getMetricsForRange } = require('../services/balance');

const router = express.Router();

// GET /metrics/range?start=YYYY-MM-DD&end=YYYY-MM-DD
// Flexible endpoint for any date range (week, month, year, custom)
router.get('/range', async (req, res, next) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ ok: false, error: 'start and end are required (YYYY-MM-DD)' });
    }

    const metrics = await getMetricsForRange(start, end);
    res.json({ ok: true, metrics });
  } catch (err) {
    next(err);
  }
});

// GET /metrics/weekly?start=YYYY-MM-DD (legacy, uses range internally)
router.get('/weekly', async (req, res, next) => {
  try {
    const { start } = req.query;
    if (!start) {
      return res.status(400).json({ ok: false, error: 'start is required (YYYY-MM-DD)' });
    }

    const metrics = await getWeeklyMetrics(start);
    res.json({ ok: true, metrics });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
