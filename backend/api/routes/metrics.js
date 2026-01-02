const express = require('express');
const { getWeeklyMetrics } = require('../services/balance');

const router = express.Router();

// GET /metrics/weekly?start=YYYY-MM-DD
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
