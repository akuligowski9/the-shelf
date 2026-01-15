const pool = require('../db/pool');

/**
 * Get metrics for any date range.
 * Returns aggregated data for charts and summaries.
 */
async function getMetricsForRange(startDate, endDate) {
  const habitsR = await pool.query(
    'SELECT id, name, color, target_minutes FROM habits ORDER BY COALESCE(sort_order, 9999), name ASC'
  );

  // Total minutes per habit
  const minutesR = await pool.query(
    `
    SELECT habit_id, COALESCE(SUM(duration_minutes), 0)::int AS minutes
    FROM entries
    WHERE type = 'habit'
      AND occurred_at >= $1::date
      AND occurred_at < $2::date
      AND archived_at IS NULL
    GROUP BY habit_id
    `,
    [startDate, endDate]
  );

  // Days touched per habit
  const daysTouchedR = await pool.query(
    `
    SELECT habit_id, COUNT(DISTINCT occurred_at::date)::int AS days_touched
    FROM entries
    WHERE type = 'habit'
      AND occurred_at >= $1::date
      AND occurred_at < $2::date
      AND archived_at IS NULL
    GROUP BY habit_id
    `,
    [startDate, endDate]
  );

  // Session count per habit
  const sessionsR = await pool.query(
    `
    SELECT habit_id, COUNT(*)::int AS sessions
    FROM entries
    WHERE type = 'habit'
      AND occurred_at >= $1::date
      AND occurred_at < $2::date
      AND archived_at IS NULL
    GROUP BY habit_id
    `,
    [startDate, endDate]
  );

  // Highlights by type
  const highlightsR = await pool.query(
    `
    SELECT type, COUNT(*)::int AS count
    FROM entries
    WHERE is_highlight = true
      AND occurred_at >= $1::date
      AND occurred_at < $2::date
      AND archived_at IS NULL
    GROUP BY type
    `,
    [startDate, endDate]
  );

  // Life and caution counts AND minutes
  const lifeCautionR = await pool.query(
    `
    SELECT type, COUNT(*)::int AS count, COALESCE(SUM(duration_minutes), 0)::int AS minutes
    FROM entries
    WHERE type IN ('life', 'caution')
      AND occurred_at >= $1::date
      AND occurred_at < $2::date
      AND archived_at IS NULL
    GROUP BY type
    `,
    [startDate, endDate]
  );

  // Daily breakdown for charts (minutes per habit per day)
  const dailyR = await pool.query(
    `
    SELECT
      occurred_at::date AS date,
      habit_id,
      type,
      COALESCE(SUM(duration_minutes), 0)::int AS minutes,
      COUNT(*)::int AS entries
    FROM entries
    WHERE occurred_at >= $1::date
      AND occurred_at < $2::date
      AND archived_at IS NULL
    GROUP BY occurred_at::date, habit_id, type
    ORDER BY occurred_at::date
    `,
    [startDate, endDate]
  );

  // Rest days (days with preparations marked as rest)
  const restDaysR = await pool.query(
    `
    SELECT COUNT(*)::int AS rest_days
    FROM preparations
    WHERE period_type = 'day'
      AND rest_day = true
      AND period_start >= $1::date
      AND period_start < $2::date
    `,
    [startDate, endDate]
  );

  // Build habit summary map
  const minutesByHabit = new Map(minutesR.rows.map(r => [r.habit_id, r.minutes]));
  const daysByHabit = new Map(daysTouchedR.rows.map(r => [r.habit_id, r.days_touched]));
  const sessionsByHabit = new Map(sessionsR.rows.map(r => [r.habit_id, r.sessions]));

  const habits = habitsR.rows.map(h => ({
    id: h.id,
    name: h.name,
    color: h.color,
    target_minutes: h.target_minutes,
    minutes: minutesByHabit.get(h.id) || 0,
    days_touched: daysByHabit.get(h.id) || 0,
    sessions: sessionsByHabit.get(h.id) || 0,
  }));

  // Build highlights map
  const highlightsByType = {};
  highlightsR.rows.forEach(r => {
    highlightsByType[r.type] = r.count;
  });

  // Build life/caution counts and minutes
  const lifeCautionByType = {};
  lifeCautionR.rows.forEach(r => {
    lifeCautionByType[r.type] = { count: r.count, minutes: r.minutes };
  });

  // Build daily data for charts
  const dailyData = {};
  dailyR.rows.forEach(r => {
    const dateKey = r.date.toISOString().split('T')[0];
    if (!dailyData[dateKey]) {
      dailyData[dateKey] = { date: dateKey, habits: {}, life: 0, life_entries: 0, caution: 0, caution_entries: 0 };
    }
    if (r.type === 'habit' && r.habit_id) {
      dailyData[dateKey].habits[r.habit_id] = {
        minutes: r.minutes,
        entries: r.entries,
      };
    } else if (r.type === 'life') {
      dailyData[dateKey].life = r.minutes;
      dailyData[dateKey].life_entries = r.entries;
    } else if (r.type === 'caution') {
      dailyData[dateKey].caution = r.minutes;
      dailyData[dateKey].caution_entries = r.entries;
    }
  });

  // Convert to sorted array
  const daily = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));

  return {
    start_date: startDate,
    end_date: endDate,
    habits,
    totals: {
      minutes: habits.reduce((sum, h) => sum + h.minutes, 0),
      sessions: habits.reduce((sum, h) => sum + h.sessions, 0),
      life_entries: lifeCautionByType.life?.count || 0,
      life_minutes: lifeCautionByType.life?.minutes || 0,
      caution_entries: lifeCautionByType.caution?.count || 0,
      caution_minutes: lifeCautionByType.caution?.minutes || 0,
      rest_days: restDaysR.rows[0]?.rest_days || 0,
      highlights: {
        habit: highlightsByType.habit || 0,
        life: highlightsByType.life || 0,
        caution: highlightsByType.caution || 0,
        total: Object.values(highlightsByType).reduce((sum, c) => sum + c, 0),
      },
    },
    daily,
  };
}

/**
 * Legacy weekly metrics (calls getMetricsForRange internally)
 */
async function getWeeklyMetrics(startDate) {
  // Calculate end date (7 days from start)
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  const endDate = end.toISOString().split('T')[0];

  return getMetricsForRange(startDate, endDate);
}

module.exports = { getMetricsForRange, getWeeklyMetrics };
