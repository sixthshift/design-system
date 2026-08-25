/**
 * Current time/date utilities
 *
 * Functions that answer "what time/date is it right now?"
 */

import { Temporal } from "@js-temporal/polyfill";

/**
 * Get the current instant (point in time)
 */
export function now(): Temporal.Instant {
  return Temporal.Now.instant();
}

/**
 * Get the current instant as an ISO 8601 string
 */
export function nowISO(): string {
  return Temporal.Now.instant().toString();
}

/**
 * Get today's date in the system timezone
 */
export function today(): Temporal.PlainDate {
  return Temporal.Now.plainDateISO();
}

/**
 * Get today's date as an ISO 8601 string
 */
export function todayISO(): string {
  return Temporal.Now.plainDateISO().toString();
}

/**
 * Get the current time in the system timezone
 */
export function currentTime(): Temporal.PlainTime {
  return Temporal.Now.plainTimeISO();
}

/**
 * Get the current date/time in the system timezone (without timezone info)
 */
export function nowDateTime(): Temporal.PlainDateTime {
  return Temporal.Now.plainDateTimeISO();
}

/**
 * Get the current date/time as an ISO 8601 string (without timezone info)
 */
export function nowDateTimeISO(): string {
  return Temporal.Now.plainDateTimeISO().toString();
}

/**
 * Get the current zoned date/time in the system timezone
 */
export function nowZoned(): Temporal.ZonedDateTime {
  return Temporal.Now.zonedDateTimeISO();
}

/**
 * Get the current zoned date/time in a specific timezone
 */
export function nowInTimezone(timezone: string): Temporal.ZonedDateTime {
  return Temporal.Now.zonedDateTimeISO(timezone);
}
