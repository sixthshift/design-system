/**
 * Time period boundary utilities
 *
 * Functions that find the start/end of time periods (day, week, month, year)
 */

import type { Temporal } from "@js-temporal/polyfill";

/**
 * Get the start of the day (midnight)
 */
export function startOfDay(date: Temporal.PlainDate): Temporal.PlainDateTime {
  return date.toPlainDateTime({ hour: 0, minute: 0, second: 0 });
}

/**
 * Get the end of the day (23:59:59.999999999)
 */
export function endOfDay(date: Temporal.PlainDate): Temporal.PlainDateTime {
  return date.toPlainDateTime({
    hour: 23,
    minute: 59,
    second: 59,
    millisecond: 999,
    microsecond: 999,
    nanosecond: 999,
  });
}

/**
 * First day of the week, as used by calendars: 0 = Sunday through 6 = Saturday.
 * Note this is NOT Temporal's `dayOfWeek`, which is ISO 8601 (1 = Monday,
 * 7 = Sunday) — `daysSinceWeekStart` converts between the two.
 */
export type WeekStartsOn = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * How many days `date` sits past the start of its week, 0-6.
 */
function daysSinceWeekStart(date: Temporal.PlainDate, weekStartsOn: WeekStartsOn): number {
  // weekStartsOn counts from Sunday; dayOfWeek counts from Monday and uses 7
  // for Sunday, so Sunday maps to 7 rather than 0.
  const isoWeekStart = weekStartsOn === 0 ? 7 : weekStartsOn;
  return (date.dayOfWeek - isoWeekStart + 7) % 7;
}

/**
 * Get the start of the week (Monday by default, configurable)
 * @param date The date to find the week start for
 * @param weekStartsOn 0 = Sunday, 1 = Monday (default), through 6 = Saturday
 */
export function startOfWeek(date: Temporal.PlainDate, weekStartsOn: WeekStartsOn = 1): Temporal.PlainDate {
  return date.subtract({ days: daysSinceWeekStart(date, weekStartsOn) });
}

/**
 * Get the end of the week — the day before the next week's start.
 * @param date The date to find the week end for
 * @param weekStartsOn 0 = Sunday, 1 = Monday (default), through 6 = Saturday
 */
export function endOfWeek(date: Temporal.PlainDate, weekStartsOn: WeekStartsOn = 1): Temporal.PlainDate {
  return date.add({ days: 6 - daysSinceWeekStart(date, weekStartsOn) });
}

/**
 * Get the start of the month
 */
export function startOfMonth(date: Temporal.PlainDate): Temporal.PlainDate {
  return date.with({ day: 1 });
}

/**
 * Get the end of the month
 */
export function endOfMonth(date: Temporal.PlainDate): Temporal.PlainDate {
  return date.with({ day: date.daysInMonth });
}

/**
 * Get the start of the year
 */
export function startOfYear(date: Temporal.PlainDate): Temporal.PlainDate {
  return date.with({ month: 1, day: 1 });
}

/**
 * Get the end of the year
 */
export function endOfYear(date: Temporal.PlainDate): Temporal.PlainDate {
  return date.with({ month: 12, day: 31 });
}
