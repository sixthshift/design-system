/**
 * Parsing utilities: External data → Temporal
 *
 * Use these at integration boundaries when receiving data from external sources:
 * - ISO 8601 strings from APIs
 * - Date objects from Node.js APIs or third-party libraries
 */

import { Temporal } from "@js-temporal/polyfill";

/**
 * Parse an ISO 8601 instant string to Temporal.Instant
 *
 * @example
 * parseInstant('2025-01-15T14:30:00.000Z')
 * // → Temporal.Instant
 */
export function parseInstant(iso: string): Temporal.Instant {
  return Temporal.Instant.from(iso);
}

/**
 * Parse an ISO 8601 instant string to Temporal.Instant, or undefined if input is nullish
 */
export function parseInstantOrUndefined(iso: string | null | undefined): Temporal.Instant | undefined {
  return iso ? Temporal.Instant.from(iso) : undefined;
}

/**
 * Parse an ISO 8601 date string to Temporal.PlainDate
 *
 * Accepts formats:
 * - '2025-01-15' (date only)
 * - '2025-01-15T14:30:00' (datetime, time portion ignored)
 * - '2025-01-15T14:30:00Z' (datetime with Z, time portion ignored)
 * - '2025-01-15T14:30:00.000Z' (datetime with milliseconds and Z)
 *
 * @example
 * parseDate('2025-01-15')
 * // → Temporal.PlainDate
 */
export function parseDate(iso: string): Temporal.PlainDate {
  // Extract just the date portion (first 10 characters: YYYY-MM-DD)
  const datePart = iso.slice(0, 10);
  return Temporal.PlainDate.from(datePart);
}

/**
 * Parse an ISO 8601 date string to Temporal.PlainDate, or undefined if input is nullish
 *
 * Accepts same formats as parseDate.
 */
export function parseDateOrUndefined(iso: string | null | undefined): Temporal.PlainDate | undefined {
  if (!iso) return undefined;
  const datePart = iso.slice(0, 10);
  return Temporal.PlainDate.from(datePart);
}

/**
 * Parse an ISO 8601 time string to Temporal.PlainTime
 *
 * @example
 * parseTime('14:30:00')
 * // → Temporal.PlainTime
 */
export function parseTime(iso: string): Temporal.PlainTime {
  return Temporal.PlainTime.from(iso);
}

/**
 * Parse an ISO 8601 time string to Temporal.PlainTime, or undefined if input is nullish
 */
export function parseTimeOrUndefined(iso: string | null | undefined): Temporal.PlainTime | undefined {
  return iso ? Temporal.PlainTime.from(iso) : undefined;
}

/**
 * Parse an ISO 8601 datetime string to Temporal.PlainDateTime
 *
 * Accepts formats:
 * - '2025-01-15T14:30:00' (datetime)
 * - '2025-01-15T14:30:00Z' (datetime with Z, Z is stripped)
 * - '2025-01-15T14:30:00.000Z' (datetime with milliseconds and Z)
 *
 * @example
 * parseDateTime('2025-01-15T14:30:00')
 * // → Temporal.PlainDateTime
 */
export function parseDateTime(iso: string): Temporal.PlainDateTime {
  // Strip trailing Z if present (PlainDateTime doesn't accept timezone designators)
  const normalized = iso.endsWith("Z") ? iso.slice(0, -1) : iso;
  return Temporal.PlainDateTime.from(normalized);
}

/**
 * Parse an ISO 8601 datetime string to Temporal.PlainDateTime, or undefined if input is nullish
 *
 * Accepts same formats as parseDateTime.
 */
export function parseDateTimeOrUndefined(iso: string | null | undefined): Temporal.PlainDateTime | undefined {
  if (!iso) return undefined;
  const normalized = iso.endsWith("Z") ? iso.slice(0, -1) : iso;
  return Temporal.PlainDateTime.from(normalized);
}

/**
 * Parse an ISO 8601 zoned datetime string to Temporal.ZonedDateTime
 *
 * Accepts formats:
 * - '2025-01-15T14:30:00[America/New_York]'
 * - '2025-01-15T14:30:00-05:00[America/New_York]'
 *
 * @example
 * parseZoned('2025-01-15T14:30:00[America/New_York]')
 * // → Temporal.ZonedDateTime
 */
export function parseZoned(iso: string): Temporal.ZonedDateTime {
  return Temporal.ZonedDateTime.from(iso);
}

/**
 * Parse an ISO 8601 zoned datetime string to Temporal.ZonedDateTime, or undefined if input is nullish
 */
export function parseZonedOrUndefined(iso: string | null | undefined): Temporal.ZonedDateTime | undefined {
  return iso ? Temporal.ZonedDateTime.from(iso) : undefined;
}

// =============================================================================
// Date object conversion
// =============================================================================

/**
 * Convert a JavaScript Date object to Temporal.Instant
 *
 * Use this at API boundaries where external libraries return Date objects
 * (e.g., Node.js fs.Stats.mtime, pg driver timestamptz columns, pg-boss next_run_on)
 *
 * @example
 * // Converting fs.Stats mtime
 * const instant = fromDate(stats.mtime);
 *
 * // Converting pg driver Date
 * const instant = fromDate(pgResult.created_at);
 */
// biome-ignore lint/style/noRestrictedGlobals: Date parameter required for converting from external APIs
export function fromDate(date: Date): Temporal.Instant {
  return Temporal.Instant.fromEpochMilliseconds(date.getTime());
}

// =============================================================================
// Duration parsing
// =============================================================================

/**
 * Parse an ISO 8601 duration string to Temporal.Duration
 *
 * @example
 * parseDuration('PT1H30M')
 * // → Temporal.Duration (1 hour 30 minutes)
 */
export function parseDuration(iso: string): Temporal.Duration {
  return Temporal.Duration.from(iso);
}

/**
 * Parse an ISO 8601 duration string to Temporal.Duration, or undefined if input is nullish
 */
export function parseDurationOrUndefined(iso: string | null | undefined): Temporal.Duration | undefined {
  return iso ? Temporal.Duration.from(iso) : undefined;
}
