/**
 * Validation utilities: string validation and type guards
 *
 * Use these to validate input before parsing, or to narrow types at runtime.
 */

import { Temporal } from "@js-temporal/polyfill";

// =============================================================================
// String validation (is this string valid ISO 8601?)
// =============================================================================

/**
 * Check if a string is a valid ISO 8601 date (YYYY-MM-DD)
 *
 * @example
 * isISODate('2025-01-15')  // true
 * isISODate('2025-13-45')  // false
 * isISODate('not a date')  // false
 */
export function isISODate(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    Temporal.PlainDate.from(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a string is a valid ISO 8601 time (HH:mm:ss or HH:mm)
 *
 * @example
 * isISOTime('14:30:00')  // true
 * isISOTime('14:30')     // true
 * isISOTime('25:00:00')  // false
 */
export function isISOTime(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    Temporal.PlainTime.from(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a string is a valid ISO 8601 datetime (YYYY-MM-DDTHH:mm:ss)
 *
 * @example
 * isISODateTime('2025-01-15T14:30:00')  // true
 * isISODateTime('2025-01-15')           // false (date only)
 * isISODateTime('invalid')              // false
 */
export function isISODateTime(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    Temporal.PlainDateTime.from(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a string is a valid ISO 8601 instant (with Z or offset)
 *
 * @example
 * isISOInstant('2025-01-15T14:30:00.000Z')     // true
 * isISOInstant('2025-01-15T14:30:00+05:30')    // true
 * isISOInstant('2025-01-15T14:30:00')          // false (no timezone)
 * isISOInstant('2025-01-15')                   // false (date only)
 */
export function isISOInstant(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    Temporal.Instant.from(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a string is a valid ISO 8601 zoned datetime
 *
 * @example
 * isISOZoned('2025-01-15T14:30:00[America/New_York]')           // true
 * isISOZoned('2025-01-15T14:30:00-05:00[America/New_York]')     // true
 * isISOZoned('2025-01-15T14:30:00Z')                            // false (instant, not zoned)
 */
export function isISOZoned(value: unknown): value is string {
  if (typeof value !== "string") return false;
  // Must contain a bracketed timezone identifier
  if (!value.includes("[") || !value.includes("]")) return false;
  try {
    Temporal.ZonedDateTime.from(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a string is a valid ISO 8601 duration
 *
 * @example
 * isISODuration('PT1H30M')    // true (1 hour 30 minutes)
 * isISODuration('P1D')        // true (1 day)
 * isISODuration('P1Y2M3D')    // true (1 year 2 months 3 days)
 * isISODuration('1 hour')     // false
 */
export function isISODuration(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    Temporal.Duration.from(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a string is any valid ISO 8601 date/time format
 * (date, time, datetime, instant, or zoned)
 *
 * @example
 * isISOString('2025-01-15')                    // true
 * isISOString('2025-01-15T14:30:00.000Z')      // true
 * isISOString('not a date')                    // false
 */
export function isISOString(value: unknown): value is string {
  return isISODate(value) || isISOTime(value) || isISODateTime(value) || isISOInstant(value) || isISOZoned(value);
}

// =============================================================================
// Type guards (is this value a Temporal type?)
// =============================================================================

/**
 * Check if a value is a Temporal.PlainDate
 */
export function isPlainDate(value: unknown): value is Temporal.PlainDate {
  return value instanceof Temporal.PlainDate;
}

/**
 * Check if a value is a Temporal.PlainTime
 */
export function isPlainTime(value: unknown): value is Temporal.PlainTime {
  return value instanceof Temporal.PlainTime;
}

/**
 * Check if a value is a Temporal.PlainDateTime
 */
export function isPlainDateTime(value: unknown): value is Temporal.PlainDateTime {
  return value instanceof Temporal.PlainDateTime;
}

/**
 * Check if a value is a Temporal.Instant
 */
export function isInstant(value: unknown): value is Temporal.Instant {
  return value instanceof Temporal.Instant;
}

/**
 * Check if a value is a Temporal.ZonedDateTime
 */
export function isZonedDateTime(value: unknown): value is Temporal.ZonedDateTime {
  return value instanceof Temporal.ZonedDateTime;
}

/**
 * Check if a value is a Temporal.Duration
 */
export function isDuration(value: unknown): value is Temporal.Duration {
  return value instanceof Temporal.Duration;
}

/**
 * Check if a value is any Temporal date/time type
 */
export function isTemporal(
  value: unknown
): value is Temporal.PlainDate | Temporal.PlainTime | Temporal.PlainDateTime | Temporal.Instant | Temporal.ZonedDateTime | Temporal.Duration {
  return isPlainDate(value) || isPlainTime(value) || isPlainDateTime(value) || isInstant(value) || isZonedDateTime(value) || isDuration(value);
}

// =============================================================================
// Validation with error messages
// =============================================================================

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate an ISO date string and return detailed error if invalid
 */
export function validateISODate(value: unknown): ValidationResult {
  if (typeof value !== "string") {
    return { valid: false, error: `Expected string, got ${typeof value}` };
  }
  try {
    Temporal.PlainDate.from(value);
    return { valid: true };
  } catch (e) {
    return {
      valid: false,
      error: e instanceof Error ? e.message : "Invalid ISO date",
    };
  }
}

/**
 * Validate an ISO instant string and return detailed error if invalid
 */
export function validateISOInstant(value: unknown): ValidationResult {
  if (typeof value !== "string") {
    return { valid: false, error: `Expected string, got ${typeof value}` };
  }
  try {
    Temporal.Instant.from(value);
    return { valid: true };
  } catch (e) {
    return {
      valid: false,
      error: e instanceof Error ? e.message : "Invalid ISO instant",
    };
  }
}

/**
 * Validate an ISO zoned datetime string and return detailed error if invalid
 */
export function validateISOZoned(value: unknown): ValidationResult {
  if (typeof value !== "string") {
    return { valid: false, error: `Expected string, got ${typeof value}` };
  }
  if (!value.includes("[") || !value.includes("]")) {
    return {
      valid: false,
      error: "Zoned datetime must include timezone in brackets, e.g. [America/New_York]",
    };
  }
  try {
    Temporal.ZonedDateTime.from(value);
    return { valid: true };
  } catch (e) {
    return {
      valid: false,
      error: e instanceof Error ? e.message : "Invalid ISO zoned datetime",
    };
  }
}

/**
 * Validate an ISO duration string and return detailed error if invalid
 */
export function validateISODuration(value: unknown): ValidationResult {
  if (typeof value !== "string") {
    return { valid: false, error: `Expected string, got ${typeof value}` };
  }
  try {
    Temporal.Duration.from(value);
    return { valid: true };
  } catch (e) {
    return {
      valid: false,
      error: e instanceof Error ? e.message : "Invalid ISO duration",
    };
  }
}
