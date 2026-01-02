const pool = require('../db/pool');

/**
 * Weekly metrics derived from entries.
 * - minutes per habit
 * - days touched per habit
 * - highlight count
 * - life entry count
 */
async function getWeeklyMetrics(startDate) {
  // startDate = YYYY-MM-DD, end = start + 7 days (exclusive)
  const habitsR = await pool.query('SELECT id, name, target_minutes FROM habits ORDER BY COALESCE(sort_order, 9999), name ASC');

  const range = await pool.query(
    `
    SELECT
      $1::date AS start_date,
      ($1::date + INTERVAL '7 days')::date AS end_date_exclusive
    `,
    [startDate]
  );

  const { start_date, end_date_exclusive } = range.rows[0];

  // minutes per habit
  const minutesR = await pool.query(
    `
    SELECT habit_id, COALESCE(SUM(duration_minutes), 0)::int AS minutes
    FROM entries
    WHERE type = 'habit'
      AND occurred_at >= $1::date
      AND occurred_at <  $2::date
    GROUP BY habit_id
    `,
    [start_date, end_date_exclusive]
  );

  // days touched per habit (any entry counts as touch, regardless of duration)
  const daysTouchedR = await pool.query(
    `
    SELECT habit_id, COUNT(DISTINCT occurred_at::date)::int AS days_touched
    FROM entries
    WHERE type = 'habit'
      AND occurred_at >= $1::date
      AND occurred_at <  $2::date
    GROUP BY habit_id
    `,
    [start_date, end_date_exclusive]
  );

  const highlightsR = await pool.query(
    `
    SELECT COUNT(*)::int AS highlights
    FROM entries
    WHERE is_highlight = true
      AND occurred_at >= $1::date
      AND occurred_at <  $2::date
    `,
    [start_date, end_date_exclusive]
  );

  const lifeR = await pool.query(
    `
    SELECT COUNT(*)::int AS life_entries
    FROM entries
    WHERE type = 'life'
      AND occurred_at >= $1::date
      AND occurred_at <  $2::date
    `,
    [start_date, end_date_exclusive]
  );

  const minutesByHabit = new Map(minutesR.rows.map(r => [r.habit_id, r.minutes]));
  const daysByHabit = new Map(daysTouchedR.rows.map(r => [r.habit_id, r.days_touched]));

  const habits = habitsR.rows.map(h => ({
    habit_id: h.id,
    habit: h.name,
    target_minutes: h.target_minutes,
    minutes: minutesByHabit.get(h.id) || 0,
    days_touched: daysByHabit.get(h.id) || 0
  }));

  return {
    start_date,
    end_date_exclusive,
    habits,
    highlights: highlightsR.rows[0]?.highlights || 0,
    life_entries: lifeR.rows[0]?.life_entries || 0
  };
}

module.exports = { getWeeklyMetrics };
