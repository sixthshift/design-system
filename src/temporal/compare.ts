/**
 * Comparison utilities
 *
 * Boolean comparison operations for dates and instants
 */

import { Temporal } from "@js-temporal/polyfill";
import { now, today } from "./now";

/**
 * Check if date A is before date B
 */
export function isBefore(a: Temporal.PlainDate, b: Temporal.PlainDate): boolean {
  return Temporal.PlainDate.compare(a, b) < 0;
}

/**
 * Check if date A is after date B
 */
export function isAfter(a: Temporal.PlainDate, b: Temporal.PlainDate): boolean {
  return Temporal.PlainDate.compare(a, b) > 0;
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(a: Temporal.PlainDate, b: Temporal.PlainDate): boolean {
  return Temporal.PlainDate.compare(a, b) === 0;
}

/**
 * Check if two dates are in the same month and year
 */
export function isSameMonth(a: Temporal.PlainDate, b: Temporal.PlainDate): boolean {
  return a.year === b.year && a.month === b.month;
}

/**
 * Check if instant A is before instant B
 */
export function isInstantBefore(a: Temporal.Instant, b: Temporal.Instant): boolean {
  return Temporal.Instant.compare(a, b) < 0;
}

/**
 * Check if instant A is after instant B
 */
export function isInstantAfter(a: Temporal.Instant, b: Temporal.Instant): boolean {
  return Temporal.Instant.compare(a, b) > 0;
}

/**
 * Check if a date is today
 */
export function isToday(date: Temporal.PlainDate): boolean {
  return isSameDay(date, today());
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Temporal.PlainDate): boolean {
  return isBefore(date, today());
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: Temporal.PlainDate): boolean {
  return isAfter(date, today());
}

/**
 * Check if an instant is in the past
 */
export function isInstantPast(instant: Temporal.Instant): boolean {
  return isInstantBefore(instant, now());
}

/**
 * Check if an instant is in the future
 */
export function isInstantFuture(instant: Temporal.Instant): boolean {
  return isInstantAfter(instant, now());
}
