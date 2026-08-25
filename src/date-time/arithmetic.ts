/**
 * Date/time arithmetic utilities
 *
 * Functions that modify or calculate differences between dates
 */

import { Temporal } from "@js-temporal/polyfill";

/**
 * Add days to a date
 */
export function addDays(date: Temporal.PlainDate, days: number): Temporal.PlainDate {
  return date.add({ days });
}

/**
 * Subtract days from a date
 */
export function subtractDays(date: Temporal.PlainDate, days: number): Temporal.PlainDate {
  return date.subtract({ days });
}

/**
 * Add months to a date
 */
export function addMonths(date: Temporal.PlainDate, months: number): Temporal.PlainDate {
  return date.add({ months });
}

/**
 * Subtract months from a date
 */
export function subtractMonths(date: Temporal.PlainDate, months: number): Temporal.PlainDate {
  return date.subtract({ months });
}

/**
 * Add weeks to a date
 */
export function addWeeks(date: Temporal.PlainDate, weeks: number): Temporal.PlainDate {
  return date.add({ weeks });
}

/**
 * Subtract weeks from a date
 */
export function subtractWeeks(date: Temporal.PlainDate, weeks: number): Temporal.PlainDate {
  return date.subtract({ weeks });
}

/**
 * Get the difference in days between two dates
 */
export function diffInDays(from: Temporal.PlainDate, to: Temporal.PlainDate): number {
  return from.until(to, { largestUnit: "day" }).days;
}

/**
 * Get the difference in months between two dates
 */
export function diffInMonths(from: Temporal.PlainDate, to: Temporal.PlainDate): number {
  const diff = from.until(to, { largestUnit: "month" });
  return diff.months + diff.years * 12;
}

/**
 * Get the difference in minutes between two instants
 */
export function differenceInMinutes(from: Temporal.Instant, to: Temporal.Instant): number {
  const diff = from.until(to, { largestUnit: "minute" });
  return Math.floor(diff.total("minutes"));
}

/**
 * Generate an array of dates from start to end (inclusive)
 *
 * @example
 * eachDayOfInterval(parseDate('2025-01-15'), parseDate('2025-01-17'))
 * // → [2025-01-15, 2025-01-16, 2025-01-17]
 */
export function eachDayOfInterval(start: Temporal.PlainDate, end: Temporal.PlainDate): Temporal.PlainDate[] {
  const dates: Temporal.PlainDate[] = [];
  let current = start;

  // Handle both forward and backward intervals
  if (Temporal.PlainDate.compare(start, end) <= 0) {
    // Forward: start <= end
    while (Temporal.PlainDate.compare(current, end) <= 0) {
      dates.push(current);
      current = current.add({ days: 1 });
    }
  } else {
    // Backward: start > end
    while (Temporal.PlainDate.compare(current, end) >= 0) {
      dates.push(current);
      current = current.subtract({ days: 1 });
    }
  }

  return dates;
}
