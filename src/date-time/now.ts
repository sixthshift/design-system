/**
 * Current time/date utilities
 *
 * Functions that answer "what time/date is it right now?"
 */

import { Temporal } from "@js-temporal/polyfill";
import type { ISODate, ISODateTime, ISOInstant } from "./iso";

/**
 * Get the current instant (point in time)
 */
export function now(): Temporal.Instant {
  return Temporal.Now.instant();
}

/**
 * Get the current instant as a canonical ISO 8601 string (UTC, `...Z`)
 */
export function nowISO(): ISOInstant {
  return Temporal.Now.instant().toString() as ISOInstant;
}

/**
 * Get today's date in the system timezone
 */
export function today(): Temporal.PlainDate {
  return Temporal.Now.plainDateISO();
}

/**
 * Get today's date as a canonical ISO 8601 string (`YYYY-MM-DD`)
 */
export function todayISO(): ISODate {
  return Temporal.Now.plainDateISO().toString() as ISODate;
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
 * Get the current date/time as a canonical ISO 8601 string (no timezone)
 */
export function nowDateTimeISO(): ISODateTime {
  return Temporal.Now.plainDateTimeISO().toString() as ISODateTime;
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
