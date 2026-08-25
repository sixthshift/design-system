/**
 * Formatting utilities: Human-readable display strings
 *
 * For ISO 8601 serialization (APIs/storage), use serialize() from serialize.ts
 * This module provides only human-readable formatting for UI display.
 *
 * API Overview (31 functions):
 *
 * Date Formats (PlainDate input):
 *   formatDateShort             "Jan 15"
 *   formatDateShortYear         "Jan 15, 2025"
 *   formatDateMedium            "January 15"
 *   formatDateMediumYear        "January 15, 2025"
 *   formatDateShortWeekday      "Wed, Jan 15"
 *   formatDateShortWeekdayYear  "Wed, Jan 15, 2025"
 *   formatDateLong              "Wednesday, January 15"
 *   formatDateFull              "Wednesday, January 15, 2025"
 *   formatDateNumeric           "1/15"
 *   formatDateNumericYear       "1/15/2025"
 *   formatMonthYear             "January 2025"
 *   formatMonthYearShort        "Jan 2025"
 *
 * Time Formats (PlainTime input):
 *   formatTime                  "2:30 PM"
 *   formatTimePadded            "02:30 PM"
 *   formatTimeCompact           "2 PM" / "2:30 PM"
 *   formatTimeHour              "2pm"
 *   formatTime24                "14:30:45"
 *
 * Composite Type Formats (DateTime/Zoned/Instant input):
 *   formatDateTimeTime          PlainDateTime → "2:30 PM"
 *   formatZonedTime             ZonedDateTime → "2:30 PM"
 *   formatInstantTime           Instant → "2:30 PM"
 *   formatInstantDateTime       Instant → "Jan 24, 2026, 3:30 PM"
 *   formatInstantShortYear      Instant → "Jan 24, 2026"
 *
 * Pattern-Based Formatting:
 *   formatDate                  PlainDate + pattern → custom string
 *
 * Date Range Formats:
 *   formatDateRange             "Jan 24 - 25, 2026"
 *   formatWeekRange             "Jan 12 - 18, 2025"
 *
 * Relative Formats:
 *   formatRelative              "today" / "tomorrow" / "3 days ago"
 *   formatRelativeInstant       "just now" / "5m ago" / "2h ago"
 *   formatRelativeToNow         "3 hours ago" / "in 2 days"
 *
 * Duration Formats:
 *   formatMilliseconds          "1.5s" / "5m 30s"
 *   formatDurationShort         "5min" / "1hr 30min"
 */

import { Temporal } from "@js-temporal/polyfill";
import { diffInDays } from "./arithmetic";
import { toHours, toMinutes } from "./duration";
import { now, today } from "./now";

// =============================================================================
// 1. Date Formats (PlainDate → string)
// =============================================================================

/**
 * Format a date as "Jan 15" (short month, day)
 *
 * @example
 * formatDateShort(parseDate('2025-01-15'))
 * // → 'Jan 15'
 */
export function formatDateShort(date: Temporal.PlainDate): string {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a date as "Jan 15, 2025" (short month, day, year)
 *
 * @example
 * formatDateShortYear(parseDate('2025-01-15'))
 * // → 'Jan 15, 2025'
 */
export function formatDateShortYear(date: Temporal.PlainDate): string {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a date as "January 15" (long month, day)
 *
 * @example
 * formatDateMedium(parseDate('2025-01-15'))
 * // → 'January 15'
 */
export function formatDateMedium(date: Temporal.PlainDate): string {
  return date.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
  });
}

/**
 * Format a date as "January 15, 2025" (long month, day, year)
 *
 * @example
 * formatDateMediumYear(parseDate('2025-01-15'))
 * // → 'January 15, 2025'
 */
export function formatDateMediumYear(date: Temporal.PlainDate): string {
  return date.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a date as "Wed, Jan 15" (short weekday, short month, day)
 *
 * @example
 * formatDateShortWeekday(parseDate('2025-01-15'))
 * // → 'Wed, Jan 15'
 */
export function formatDateShortWeekday(date: Temporal.PlainDate): string {
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a date as "Wed, Jan 15, 2025" (short weekday, short month, day, year)
 *
 * @example
 * formatDateShortWeekdayYear(parseDate('2025-01-15'))
 * // → 'Wed, Jan 15, 2025'
 */
export function formatDateShortWeekdayYear(date: Temporal.PlainDate): string {
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a date as "Wednesday, January 15" (long weekday, long month, day)
 *
 * @example
 * formatDateLong(parseDate('2025-01-15'))
 * // → 'Wednesday, January 15'
 */
export function formatDateLong(date: Temporal.PlainDate): string {
  return date.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format a date as "Wednesday, January 15, 2025" (long weekday, long month, day, year)
 *
 * @example
 * formatDateFull(parseDate('2025-01-15'))
 * // → 'Wednesday, January 15, 2025'
 */
export function formatDateFull(date: Temporal.PlainDate): string {
  return date.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a date as "1/15" (numeric month/day)
 *
 * @example
 * formatDateNumeric(parseDate('2025-01-15'))
 * // → '1/15'
 */
export function formatDateNumeric(date: Temporal.PlainDate): string {
  return `${date.month}/${date.day}`;
}

/**
 * Format a date as "1/15/2025" (numeric month/day/year)
 *
 * @example
 * formatDateNumericYear(parseDate('2025-01-15'))
 * // → '1/15/2025'
 */
export function formatDateNumericYear(date: Temporal.PlainDate): string {
  return `${date.month}/${date.day}/${date.year}`;
}

/**
 * Format a date as "January 2025" (long month, year)
 *
 * @example
 * formatMonthYear(parseDate('2025-01-15'))
 * // → 'January 2025'
 */
export function formatMonthYear(date: Temporal.PlainDate): string {
  return date.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
}

/**
 * Format a date as "Jan 2025" (short month, year)
 *
 * @example
 * formatMonthYearShort(parseDate('2025-01-15'))
 * // → 'Jan 2025'
 */
export function formatMonthYearShort(date: Temporal.PlainDate): string {
  return date.toLocaleString("en-US", {
    month: "short",
    year: "numeric",
  });
}

// =============================================================================
// 2. Time Formats (PlainTime → string)
// =============================================================================

/**
 * Format a time as "2:30 PM" (unpadded hour, standard UI format)
 *
 * @example
 * formatTime(parseTime('14:30:00'))
 * // → '2:30 PM'
 */
export function formatTime(time: Temporal.PlainTime): string {
  return time.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Format a time as "02:30 PM" (padded hour)
 *
 * @example
 * formatTimePadded(parseTime('14:30:00'))
 * // → '02:30 PM'
 */
export function formatTimePadded(time: Temporal.PlainTime): string {
  return time.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format a time compactly: omits minutes when :00 (e.g., "2 PM", "2:30 PM")
 * Ideal for calendar entries and space-constrained time displays.
 *
 * @example
 * formatTimeCompact(parseTime('14:00:00'))
 * // → '2 PM'
 *
 * formatTimeCompact(parseTime('14:30:00'))
 * // → '2:30 PM'
 *
 * formatTimeCompact(parseTime('00:00:00'))
 * // → '12 AM'
 */
export function formatTimeCompact(time: Temporal.PlainTime): string {
  const hour12 = time.hour === 0 ? 12 : time.hour > 12 ? time.hour - 12 : time.hour;
  const period = time.hour >= 12 ? "PM" : "AM";
  if (time.minute === 0) return `${hour12} ${period}`;
  const m = String(time.minute).padStart(2, "0");
  return `${hour12}:${m} ${period}`;
}

/**
 * Format an hour as compact string (e.g., "2pm", "11am")
 * No space, lowercase - ideal for timeline x-axis labels
 *
 * @example
 * formatTimeHour(parseTime('14:00:00'))
 * // → '2pm'
 *
 * formatTimeHour(parseTime('09:00:00'))
 * // → '9am'
 */
export function formatTimeHour(time: Temporal.PlainTime): string {
  const hour12 = time.hour === 0 ? 12 : time.hour > 12 ? time.hour - 12 : time.hour;
  const period = time.hour >= 12 ? "pm" : "am";
  return `${hour12}${period}`;
}

/**
 * Format a time as 24-hour HH:mm:ss (e.g., "14:30:45")
 * Useful for logs and technical displays
 *
 * @example
 * formatTime24(parseTime('14:30:45'))
 * // → '14:30:45'
 *
 * formatTime24(parseTime('09:05:03'))
 * // → '09:05:03'
 */
export function formatTime24(time: Temporal.PlainTime): string {
  const h = String(time.hour).padStart(2, "0");
  const m = String(time.minute).padStart(2, "0");
  const s = String(time.second).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

// =============================================================================
// 3. Composite Type Formats (DateTime/Zoned/Instant → string)
// =============================================================================

/**
 * Format a datetime's time portion for display
 *
 * @example
 * formatDateTimeTime(parseDateTime('2025-01-15T14:30:00'))
 * // → '2:30 PM'
 */
export function formatDateTimeTime(dateTime: Temporal.PlainDateTime): string {
  return formatTime(dateTime.toPlainTime());
}

/**
 * Format a zoned datetime's time portion for display
 *
 * @example
 * formatZonedTime(parseZoned('2025-01-15T14:30:00-05:00[America/New_York]'))
 * // → '2:30 PM'
 */
export function formatZonedTime(zoned: Temporal.ZonedDateTime): string {
  return formatTime(zoned.toPlainTime());
}

/**
 * Format an instant's time portion for display in the local timezone
 *
 * @example
 * formatInstantTime(parseInstant('2025-01-15T19:30:00Z'))
 * // → '2:30 PM' (in America/New_York)
 */
export function formatInstantTime(instant: Temporal.Instant): string {
  const zoned = instant.toZonedDateTimeISO(Temporal.Now.timeZoneId());
  return formatTime(zoned.toPlainTime());
}

/**
 * Format an instant as date and time with year (e.g., "Jan 24, 2026, 3:30 PM")
 *
 * @example
 * formatInstantDateTime(parseInstant('2026-01-24T23:30:00Z'), 'America/Los_Angeles')
 * // → 'Jan 24, 2026, 3:30 PM'
 */
export function formatInstantDateTime(instant: Temporal.Instant, timeZone?: string): string {
  const tz = timeZone ?? Temporal.Now.timeZoneId();
  const zoned = instant.toZonedDateTimeISO(tz);
  const datePart = formatDateShortYear(zoned.toPlainDate());

  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: tz,
  };
  const timePart = instant.toLocaleString("en-US", options);

  return `${datePart}, ${timePart}`;
}

/**
 * Format Instant as short date with year in user's timezone
 *
 * @example
 * formatInstantShortYear(Temporal.Instant.from("2026-01-24T08:00:00Z"), "America/New_York")
 * // → "Jan 24, 2026"
 */
export function formatInstantShortYear(instant: Temporal.Instant, timeZone?: string): string {
  const tz = timeZone ?? Temporal.Now.timeZoneId();
  const zoned = instant.toZonedDateTimeISO(tz);
  return formatDateShortYear(zoned.toPlainDate());
}

// =============================================================================
// 4. Pattern-Based Formatting
// =============================================================================

/**
 * Format a Temporal.PlainDate with a pattern string
 *
 * Supported patterns:
 * - yyyy: 4-digit year (e.g., 2025)
 * - MMMM: Full month name (e.g., January)
 * - MMM: Short month name (e.g., Jan)
 * - MM: 2-digit month (e.g., 01)
 * - dd: 2-digit day (e.g., 05)
 * - d: Day without leading zero (e.g., 5)
 * - EEEE: Full weekday name (e.g., Monday)
 * - EEE: Short weekday name (e.g., Mon)
 *
 * @example
 * formatDate(parseDate('2025-01-15'), 'MMMM yyyy')
 * // → 'January 2025'
 *
 * formatDate(parseDate('2025-01-15'), 'MMM d')
 * // → 'Jan 15'
 *
 * formatDate(parseDate('2025-01-15'), 'EEEE, MMMM d, yyyy')
 * // → 'Wednesday, January 15, 2025'
 */
// Lookup tables for pattern-based formatting (as const for tuple types)
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] as const;

const MONTH_NAMES_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

const WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

const WEEKDAY_NAMES_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

// Type-safe indices (Temporal guarantees month 1-12, dayOfWeek 1-7)
type MonthIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export function formatDate(date: Temporal.PlainDate, pattern: string): string {
  // Temporal guarantees these indices are always valid
  const monthIndex = (date.month - 1) as MonthIndex;
  const weekdayIndex = (date.dayOfWeek - 1) as WeekdayIndex;

  let result = pattern;

  // Replace patterns (order matters - longer patterns first)
  result = result.replace(/MMMM/g, MONTH_NAMES[monthIndex]);
  result = result.replace(/MMM/g, MONTH_NAMES_SHORT[monthIndex]);
  result = result.replace(/MM/g, String(date.month).padStart(2, "0"));
  result = result.replace(/yyyy/g, String(date.year));
  result = result.replace(/dd/g, String(date.day).padStart(2, "0"));
  result = result.replace(/d/g, String(date.day));
  result = result.replace(/EEEE/g, WEEKDAY_NAMES[weekdayIndex]);
  result = result.replace(/EEE/g, WEEKDAY_NAMES_SHORT[weekdayIndex]);

  return result;
}

// =============================================================================
// 5. Date Range Formats
// =============================================================================

/**
 * Format a week date range (e.g., "Jan 12 - 18, 2025")
 *
 * @example
 * formatWeekRange(parseDate('2025-01-12'), parseDate('2025-01-18'))
 * // → 'Jan 12 - 18, 2025' (same month)
 *
 * formatWeekRange(parseDate('2025-01-26'), parseDate('2025-02-01'))
 * // → 'Jan 26 - Feb 1, 2025' (different months, same year)
 *
 * formatWeekRange(parseDate('2024-12-29'), parseDate('2025-01-04'))
 * // → 'Dec 29, 2024 - Jan 4, 2025' (different years)
 */
export function formatWeekRange(startDate: Temporal.PlainDate, endDate: Temporal.PlainDate): string {
  const sameMonth = startDate.month === endDate.month && startDate.year === endDate.year;
  const sameYear = startDate.year === endDate.year;

  if (sameMonth) {
    // "Jan 12 - 18, 2025"
    return `${formatDate(startDate, "MMM")} ${startDate.day} - ${endDate.day}, ${startDate.year}`;
  }

  if (sameYear) {
    // "Jan 26 - Feb 1, 2025"
    return `${formatDate(startDate, "MMM")} ${startDate.day} - ${formatDate(endDate, "MMM")} ${endDate.day}, ${startDate.year}`;
  }

  // "Dec 29, 2024 - Jan 4, 2025"
  return `${formatDateShortYear(startDate)} - ${formatDateShortYear(endDate)}`;
}

/**
 * Format a date range intelligently
 * - Same day: "Jan 24, 2026"
 * - Same month: "Jan 24 - 25, 2026"
 * - Same year: "Jan 24 - Feb 2, 2026"
 * - Different years: "Dec 31, 2025 - Jan 1, 2026"
 *
 * @example
 * formatDateRange(parseDate('2026-01-24'), parseDate('2026-01-24'))
 * // → 'Jan 24, 2026'
 *
 * formatDateRange(parseDate('2026-01-24'), parseDate('2026-01-25'))
 * // → 'Jan 24 - 25, 2026'
 *
 * formatDateRange(parseDate('2026-01-24'), parseDate('2026-02-02'))
 * // → 'Jan 24 - Feb 2, 2026'
 */
export function formatDateRange(startDate: Temporal.PlainDate, endDate: Temporal.PlainDate): string {
  const sameDay = Temporal.PlainDate.compare(startDate, endDate) === 0;
  const sameMonth = startDate.month === endDate.month && startDate.year === endDate.year;
  const sameYear = startDate.year === endDate.year;

  if (sameDay) {
    return formatDateShortYear(startDate);
  }

  if (sameMonth) {
    // "Jan 24 - 25, 2026"
    return `${formatDate(startDate, "MMM")} ${startDate.day} - ${endDate.day}, ${startDate.year}`;
  }

  if (sameYear) {
    // "Jan 24 - Feb 2, 2026"
    return `${formatDate(startDate, "MMM")} ${startDate.day} - ${formatDate(endDate, "MMM")} ${endDate.day}, ${startDate.year}`;
  }

  // "Dec 31, 2025 - Jan 1, 2026"
  return `${formatDateShortYear(startDate)} - ${formatDateShortYear(endDate)}`;
}

// =============================================================================
// 6. Relative Formats
// =============================================================================

/**
 * Format a date as a relative string (today, tomorrow, 3 days ago, etc.)
 *
 * @example
 * formatRelative(parseDate('2025-01-15'))
 * // → 'today' | 'tomorrow' | 'yesterday' | 'in 3 days' | '3 days ago' | 'Jan 15, 2025'
 */
export function formatRelative(date: Temporal.PlainDate): string {
  const diff = diffInDays(today(), date);

  if (diff === 0) return "today";
  if (diff === 1) return "tomorrow";
  if (diff === -1) return "yesterday";
  if (diff < -1) return `${Math.abs(diff)} days ago`;
  if (diff < 7) return `in ${diff} days`;

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format an instant as a relative string (just now, 5m ago, 2h ago, etc.)
 *
 * @example
 * formatRelativeInstant(parseInstant('2025-01-15T14:30:00Z'))
 * // → 'just now' | '5m ago' | '2h ago' | '3d ago' | 'Jan 15, 2025'
 */
export function formatRelativeInstant(instant: Temporal.Instant): string {
  const now = Temporal.Now.instant();
  const diffNs = now.since(instant).total("nanoseconds");
  const diffMs = Math.floor(diffNs / 1_000_000);
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  // Fall back to absolute date for older timestamps
  const zoned = instant.toZonedDateTimeISO("UTC");
  return zoned.toPlainDate().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a Temporal.Instant relative to now ("3 hours ago", "in 2 days")
 *
 * @example
 * formatRelativeToNow(parseInstant('2025-01-15T14:30:00Z'))
 * // → '3 hours ago' | 'in 2 days' | 'just now'
 */
export function formatRelativeToNow(instant: Temporal.Instant): string {
  const currentInstant = now();
  const diff = currentInstant.since(instant);
  const totalSeconds = Math.abs(diff.total("seconds"));
  const isPast = diff.total("seconds") > 0;

  // Less than a minute
  if (totalSeconds < 60) {
    return "just now";
  }

  // Minutes
  if (totalSeconds < 3600) {
    const mins = Math.floor(totalSeconds / 60);
    return isPast ? `${mins} minute${mins === 1 ? "" : "s"} ago` : `in ${mins} minute${mins === 1 ? "" : "s"}`;
  }

  // Hours
  if (totalSeconds < 86400) {
    const hrs = Math.floor(totalSeconds / 3600);
    return isPast ? `${hrs} hour${hrs === 1 ? "" : "s"} ago` : `in ${hrs} hour${hrs === 1 ? "" : "s"}`;
  }

  // Days
  if (totalSeconds < 604800) {
    const days = Math.floor(totalSeconds / 86400);
    return isPast ? `${days} day${days === 1 ? "" : "s"} ago` : `in ${days} day${days === 1 ? "" : "s"}`;
  }

  // Weeks
  if (totalSeconds < 2592000) {
    const weeks = Math.floor(totalSeconds / 604800);
    return isPast ? `${weeks} week${weeks === 1 ? "" : "s"} ago` : `in ${weeks} week${weeks === 1 ? "" : "s"}`;
  }

  // Fall back to absolute date for longer periods
  const zoned = instant.toZonedDateTimeISO(Temporal.Now.timeZoneId());
  return zoned.toPlainDate().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Compact recency label. Used in lists and rows where space is tight and
 * relative time scans as a single rhythm across pages.
 *
 *   today → "today"
 *   1–60 days → "1d", "2d", … "60d"
 *   61–364 days → "2mo", "3mo", … "11mo"
 *   365+ days → "1y", "2y", …
 *
 * Negative ranges (future instants) are not handled — this is for past-only
 * recency on entity rows.
 *
 * @example
 * formatRecency(Temporal.Now.instant())     // → 'today'
 * formatRecency(twoDaysAgo)                  // → '2d'
 * formatRecency(threeMonthsAgo)              // → '3mo'
 */
export function formatRecency(instant: Temporal.Instant): string {
  const date = instant.toZonedDateTimeISO(Temporal.Now.timeZoneId()).toPlainDate();
  const todayDate = Temporal.Now.plainDateISO();
  const days = Math.floor(todayDate.since(date).total({ unit: "day", relativeTo: date }));
  if (days <= 0) return "today";
  if (days <= 60) return `${days}d`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${Math.floor(days / 365)}y`;
}

// =============================================================================
// 7. Duration Formats
// =============================================================================

/**
 * Format milliseconds duration as human-readable string (e.g., "1.2s", "5m 30s")
 *
 * @example
 * formatMilliseconds(1500)  // → '1.5s'
 * formatMilliseconds(65000) // → '1m 5s'
 * formatMilliseconds(500)   // → '500ms'
 */
export function formatMilliseconds(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
}

/**
 * Format a Temporal.Duration as a compact human-readable string
 *
 * @example
 * formatDurationShort(minutes(5))    // → '5min'
 * formatDurationShort(hours(1))      // → '1hr'
 * formatDurationShort(hours(6))      // → '6hr'
 * formatDurationShort(days(1))       // → '1 day'
 * formatDurationShort(days(7))       // → '7 days'
 * formatDurationShort(Temporal.Duration.from({ hours: 1, minutes: 30 })) // → '1hr 30min'
 */
export function formatDurationShort(duration: Temporal.Duration): string {
  const totalMinutes = toMinutes(duration);
  const totalHours = toHours(duration);

  // Pure days (24h+, no remainder)
  if (totalMinutes >= 1440 && totalMinutes % 1440 === 0) {
    const d = totalMinutes / 1440;
    return d === 1 ? "1 day" : `${d} days`;
  }

  // Pure hours (no remaining minutes)
  if (totalMinutes >= 60 && totalMinutes % 60 === 0) {
    const h = totalHours;
    return `${h}hr`;
  }

  // Mixed hours + minutes
  if (totalMinutes >= 60) {
    const h = Math.floor(totalHours);
    const m = totalMinutes - h * 60;
    return `${h}hr ${m}min`;
  }

  // Pure minutes
  return `${totalMinutes}min`;
}
