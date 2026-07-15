/**
 * Timezone conversion utilities
 *
 * Functions for converting between timezones and working with ZonedDateTime
 */

import { Temporal } from "@js-temporal/polyfill";

/**
 * Convert an instant to a zoned date/time in a specific timezone
 */
export function toTimezone(instant: Temporal.Instant, timezone: string): Temporal.ZonedDateTime {
  return instant.toZonedDateTimeISO(timezone);
}

/**
 * Convert a zoned date/time to a different timezone
 */
export function changeTimezone(zoned: Temporal.ZonedDateTime, timezone: string): Temporal.ZonedDateTime {
  return zoned.withTimeZone(timezone);
}

/**
 * Interpret PlainDateTime in a specific timezone, returning ZonedDateTime
 *
 * @example
 * const dt = Temporal.PlainDateTime.from('2026-01-24T15:30');
 * const zoned = plainDateTimeToZonedDateTime(dt, 'America/Los_Angeles');
 * // → 2026-01-24T15:30:00-08:00[America/Los_Angeles]
 */
export function plainDateTimeToZonedDateTime(dateTime: Temporal.PlainDateTime, timezone?: string): Temporal.ZonedDateTime {
  const tz = timezone ?? Temporal.Now.timeZoneId();
  return dateTime.toZonedDateTime(tz);
}

/**
 * Interpret PlainDate as midnight in a specific timezone, returning ZonedDateTime
 *
 * @example
 * const date = Temporal.PlainDate.from('2026-01-24');
 * const zoned = plainDateToZonedDateTime(date, 'America/Los_Angeles');
 * // → 2026-01-24T00:00:00-08:00[America/Los_Angeles]
 */
export function plainDateToZonedDateTime(date: Temporal.PlainDate, timezone?: string): Temporal.ZonedDateTime {
  const tz = timezone ?? Temporal.Now.timeZoneId();
  return date.toPlainDateTime(Temporal.PlainTime.from("00:00")).toZonedDateTime(tz);
}
