/**
 * Generic serialization utilities for Temporal types
 *
 * Provides a unified way to convert any Temporal type to its ISO string representation.
 * These functions are simple wrappers around `.toString()` but provide:
 * - Type safety
 * - Consistent naming
 * - Optional value handling
 * - A single import point
 *
 * ## API Boundary Pattern
 *
 * When sending Temporal types to API endpoints, use this composition:
 *
 * ```typescript
 * import { plainDateTimeToZonedDateTime, serialize } from "@sixthshift/temporal";
 *
 * // For PlainDateTime (timezone-naive) → API string
 * const apiValue = serialize(plainDateTimeToZonedDateTime(dateTime));
 * // → "2026-01-24T15:30:00-08:00[America/Los_Angeles]"
 *
 * // For PlainDate → API string (midnight in user's timezone)
 * const apiValue = serialize(plainDateToZonedDateTime(date));
 * // → "2026-01-24T00:00:00-08:00[America/Los_Angeles]"
 *
 * // Server receives and parses to UTC Instant
 * parseInstant(apiValue) → Instant('2026-01-24T23:30:00Z')
 * ```
 *
 */

import type { Temporal } from "@js-temporal/polyfill";

/**
 * Serialize any Temporal type to its ISO 8601 string representation
 *
 * @example
 * serialize(Temporal.PlainDate.from('2026-01-24'))
 * // → '2026-01-24'
 *
 * serialize(Temporal.PlainDateTime.from('2026-01-24T15:30'))
 * // → '2026-01-24T15:30:00'
 *
 * serialize(Temporal.Instant.from('2026-01-24T04:30:00Z'))
 * // → '2026-01-24T04:30:00Z'
 */
export function serialize(
  temporal: Temporal.Instant | Temporal.PlainDate | Temporal.PlainDateTime | Temporal.PlainTime | Temporal.ZonedDateTime | Temporal.Duration
): string {
  return temporal.toString();
}

/**
 * Serialize optional Temporal type to ISO string or undefined
 *
 * @example
 * serializeOptional(undefined) // → undefined
 * serializeOptional(Temporal.PlainDate.from('2026-01-24')) // → '2026-01-24'
 */
export function serializeOptional(
  temporal: Temporal.Instant | Temporal.PlainDate | Temporal.PlainDateTime | Temporal.PlainTime | Temporal.ZonedDateTime | Temporal.Duration | null | undefined
): string | undefined {
  return temporal?.toString();
}

// Type-specific convenience functions (optional, for clarity)

export function serializeInstant(instant: Temporal.Instant): string {
  return instant.toString();
}

export function serializeDate(date: Temporal.PlainDate): string {
  return date.toString();
}

export function serializeDateTime(dateTime: Temporal.PlainDateTime): string {
  return dateTime.toString();
}

export function serializeTime(time: Temporal.PlainTime): string {
  return time.toString();
}

export function serializeZonedDateTime(zoned: Temporal.ZonedDateTime): string {
  return zoned.toString();
}

export function serializeDuration(duration: Temporal.Duration): string {
  return duration.toString();
}
