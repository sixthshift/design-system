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
 * Get the start of the week (Monday by default, configurable)
 * @param date The date to find the week start for
 * @param weekStartsOn 0 = Sunday, 1 = Monday (default)
 */
export function startOfWeek(date: Temporal.PlainDate, weekStartsOn: 0 | 1 = 1): Temporal.PlainDate {
  const dayOfWeek = date.dayOfWeek; // 1 = Monday, 7 = Sunday

  if (weekStartsOn === 1) {
    // Week starts on Monday (ISO 8601)
    return date.subtract({ days: dayOfWeek - 1 });
  }

  // Week starts on Sunday
  const daysFromSunday = dayOfWeek === 7 ? 0 : dayOfWeek;
  return date.subtract({ days: daysFromSunday });
}

/**
 * Get the end of the week (Sunday by default when week starts Monday, Saturday when week starts Sunday)
 * @param date The date to find the week end for
 * @param weekStartsOn 0 = Sunday, 1 = Monday (default)
 */
export function endOfWeek(date: Temporal.PlainDate, weekStartsOn: 0 | 1 = 1): Temporal.PlainDate {
  const dayOfWeek = date.dayOfWeek;

  if (weekStartsOn === 1) {
    // Week ends on Sunday
    return date.add({ days: 7 - dayOfWeek });
  }

  // Week ends on Saturday
  const daysToSaturday = dayOfWeek === 7 ? 6 : 6 - dayOfWeek;
  return date.add({ days: daysToSaturday });
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
