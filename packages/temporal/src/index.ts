/**
 * @sixthshift/temporal - Date/time utilities using Temporal API
 *
 * This package provides:
 * - Re-export of Temporal from @js-temporal/polyfill
 * - Parsing utilities (ISO string → Temporal)
 * - Serialization utilities (Temporal → ISO strings for APIs/storage)
 * - Formatting utilities (Temporal → human-readable strings for UI)
 * - Common utility functions
 *
 * When native Temporal lands in browsers/Node, update the Temporal export
 * in this file and all consuming packages get native support automatically.
 *
 * @example
 * import { Temporal, parseDate, serialize, formatDateShort, isToday } from '@sixthshift/temporal';
 *
 * // Parse ISO string from API
 * const dueDate = parseDate('2025-01-15');
 *
 * // Work with Temporal
 * const tomorrow = dueDate.add({ days: 1 });
 * const overdue = isToday(dueDate);
 *
 * // Serialize back to ISO for API
 * const isoString = serialize(tomorrow); // '2025-01-16'
 *
 * // Format for UI display
 * const display = formatDateShort(tomorrow); // 'Jan 16'
 */

// =============================================================================
// Temporal API (re-export from polyfill)
// =============================================================================
// When native Temporal lands, change this to:
// export const { Temporal } = globalThis;

// Re-export the Temporal namespace type for convenience
export type { Temporal as TemporalNamespace } from "@js-temporal/polyfill";
export { Temporal } from "@js-temporal/polyfill";

// =============================================================================
// Parsing: ISO 8601 string → Temporal
// =============================================================================

export {
  fromDate,
  parseDate,
  parseDateOrUndefined,
  parseDateTime,
  parseDateTimeOrUndefined,
  parseDuration,
  parseDurationOrUndefined,
  parseInstant,
  parseInstantOrUndefined,
  parseTime,
  parseTimeOrUndefined,
  parseZoned,
  parseZonedOrUndefined,
} from "./parse";

// =============================================================================
// Formatting: Temporal → strings
// =============================================================================

export {
  // Pattern-based formatting
  formatDate,
  formatDateFull,
  formatDateLong,
  formatDateMedium,
  formatDateMediumYear,
  formatDateNumeric,
  formatDateNumericYear,
  // Date range formats
  formatDateRange,
  // Date formats
  formatDateShort,
  formatDateShortWeekday,
  formatDateShortWeekdayYear,
  formatDateShortYear,
  // Composite type formats
  formatDateTimeTime,
  formatDurationShort,
  formatInstantDateTime,
  formatInstantShortYear,
  formatInstantTime,
  // Duration formats
  formatMilliseconds,
  formatMonthYear,
  formatMonthYearShort,
  // Compact recency (1d/60d/2mo/1y) for index rows
  formatRecency,
  // Relative formats
  formatRelative,
  formatRelativeInstant,
  formatRelativeToNow,
  // Time formats
  formatTime,
  formatTime24,
  formatTimeCompact,
  formatTimeHour,
  formatTimePadded,
  formatWeekRange,
  formatZonedTime,
} from "./format";

// =============================================================================
// Validation
// =============================================================================

export type { ValidationResult } from "./validate";
export {
  isDuration,
  isInstant,
  // String validation
  isISODate,
  isISODateTime,
  isISODuration,
  isISOInstant,
  isISOString,
  isISOTime,
  isISOZoned,
  // Type guards
  isPlainDate,
  isPlainDateTime,
  isPlainTime,
  isTemporal,
  isZonedDateTime,
  // Validation with errors
  validateISODate,
  validateISODuration,
  validateISOInstant,
  validateISOZoned,
} from "./validate";

// =============================================================================
// Current time
// =============================================================================

export {
  currentTime,
  now,
  nowDateTime,
  nowDateTimeISO,
  nowInTimezone,
  nowISO,
  nowZoned,
  today,
  todayISO,
} from "./now";

// =============================================================================
// Comparison
// =============================================================================

export {
  isAfter,
  isBefore,
  isFuture,
  isInstantAfter,
  isInstantBefore,
  isInstantFuture,
  isInstantPast,
  isPast,
  isSameDay,
  isSameMonth,
  isToday,
} from "./compare";

// =============================================================================
// Arithmetic
// =============================================================================

export {
  addDays,
  addMonths,
  addWeeks,
  differenceInMinutes,
  diffInDays,
  diffInMonths,
  eachDayOfInterval,
  subtractDays,
  subtractMonths,
  subtractWeeks,
} from "./arithmetic";

// =============================================================================
// Boundaries
// =============================================================================

export {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "./boundaries";

// =============================================================================
// Serialization: Temporal → ISO 8601 strings
// =============================================================================

export {
  serialize,
  serializeDate,
  serializeDateTime,
  serializeDuration,
  serializeInstant,
  serializeOptional,
  serializeTime,
  serializeZonedDateTime,
} from "./serialize";

// =============================================================================
// Timezone
// =============================================================================

export {
  changeTimezone,
  plainDateTimeToZonedDateTime,
  plainDateToZonedDateTime,
  toTimezone,
} from "./timezone";

// =============================================================================
// API Boundary Pattern
// =============================================================================
//
// When sending Temporal types to the API, use these patterns:
//
// For Instant (timezone-aware absolute time) values:
//   serialize(instant)
//   → "2026-01-24T23:30:00Z"
//
// For PlainDate (date-only, timezone-agnostic) values:
//   serialize(plainDateToZonedDateTime(date))
//   → "2026-01-24T00:00:00-08:00[America/Los_Angeles]"
//
// Why?
// - Instant is already absolute UTC time - serialize directly
// - PlainDate needs timezone context - interpret in user's timezone, then serialize
// - Server parseInstant() handles both formats correctly
//
// PREFER Instant for all datetime values in UI components and API hooks.
// PlainDate is only for date-only values (birthdays, all-day events).
//
// Example in API hook (CURRENT PATTERN):
//   const params = {
//     since: dateRange?.from ? serialize(dateRange.from) : undefined,  // dateRange uses Instant
//     until: dateRange?.to ? serialize(dateRange.to) : undefined,
//   };
//
// See: packages/web/src/api/activity-log/useActivityLog.ts for reference implementation
// =============================================================================

// =============================================================================
// Duration
// =============================================================================

export {
  days,
  hours,
  minutes,
  toHours,
  toMilliseconds,
  toMinutes,
  toSeconds,
  weeks,
} from "./duration";

// =============================================================================
// Elapsed time
// =============================================================================

export { elapsedMs, epochMs } from "./elapsed";
