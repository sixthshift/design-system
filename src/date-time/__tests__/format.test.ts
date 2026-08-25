/**
 * Tests for format.ts - Temporal to string formatting functions
 */

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  addDays,
  days,
  formatDate,
  formatDateFull,
  formatDateLong,
  formatDateMedium,
  formatDateMediumYear,
  formatDateNumeric,
  formatDateNumericYear,
  // Human-readable date formatting
  formatDateShort,
  formatDateShortWeekday,
  formatDateShortWeekdayYear,
  formatDateShortYear,
  formatDateTimeTime,
  // Duration formatting
  formatDurationShort,
  formatInstantDateTime,
  formatInstantShortYear,
  formatInstantTime,
  formatMilliseconds,
  formatMonthYear,
  formatMonthYearShort,
  // Relative formatting
  formatRelative,
  formatRelativeInstant,
  formatRelativeToNow,
  // Human-readable time formatting
  formatTime,
  formatTimeCompact,
  formatTimePadded,
  formatZonedTime,
  hours,
  minutes,
  parseDate,
  parseDateTime,
  parseDuration,
  // For creating test values
  parseInstant,
  parseTime,
  parseZoned,
  serialize,
  serializeDate,
  serializeDateTime,
  serializeDuration,
  serializeInstant,
  serializeOptional,
  serializeTime,
  serializeZonedDateTime,
  subtractDays,
  Temporal,
  today,
} from "../index";

// =============================================================================
// serialize
// =============================================================================

describe("serialize", () => {
  test("formats instant to ISO string", () => {
    const instant = parseInstant("2025-01-15T14:30:00Z");
    const result = serialize(instant);
    expect(result).toBe("2025-01-15T14:30:00Z");
  });

  test("formats instant with offset to UTC", () => {
    const instant = parseInstant("2025-01-15T14:30:00+05:30");
    const result = serialize(instant);
    // The offset is converted to UTC
    expect(result).toBe("2025-01-15T09:00:00Z");
  });

  test("formats instant with fractional seconds", () => {
    const instant = parseInstant("2025-01-15T14:30:00.123Z");
    const result = serialize(instant);
    expect(result).toBe("2025-01-15T14:30:00.123Z");
  });
});

describe("serializeOptional", () => {
  test("formats valid instant", () => {
    const instant = parseInstant("2025-01-15T14:30:00Z");
    expect(serializeOptional(instant)).toBe("2025-01-15T14:30:00Z");
  });

  test("returns undefined for null", () => {
    expect(serializeOptional(null)).toBeUndefined();
  });

  test("returns undefined for undefined", () => {
    expect(serializeOptional(undefined)).toBeUndefined();
  });
});

// =============================================================================
// serialize
// =============================================================================

describe("serialize", () => {
  test("formats date to ISO string", () => {
    const date = parseDate("2025-01-15");
    expect(serialize(date)).toBe("2025-01-15");
  });

  test("formats leap year date", () => {
    const date = parseDate("2024-02-29");
    expect(serialize(date)).toBe("2024-02-29");
  });

  test("formats year boundaries", () => {
    expect(serialize(parseDate("2025-01-01"))).toBe("2025-01-01");
    expect(serialize(parseDate("2025-12-31"))).toBe("2025-12-31");
  });
});

describe("serializeOptional", () => {
  test("formats valid date", () => {
    const date = parseDate("2025-01-15");
    expect(serializeOptional(date)).toBe("2025-01-15");
  });

  test("returns undefined for null", () => {
    expect(serializeOptional(null)).toBeUndefined();
  });

  test("returns undefined for undefined", () => {
    expect(serializeOptional(undefined)).toBeUndefined();
  });
});

// =============================================================================
// serialize
// =============================================================================

describe("serialize", () => {
  test("formats time to ISO string", () => {
    const time = parseTime("14:30:00");
    expect(serialize(time)).toBe("14:30:00");
  });

  test("formats midnight", () => {
    const time = parseTime("00:00:00");
    expect(serialize(time)).toBe("00:00:00");
  });

  test("formats time with fractional seconds", () => {
    const time = parseTime("14:30:45.123");
    expect(serialize(time)).toBe("14:30:45.123");
  });
});

describe("serializeOptional", () => {
  test("formats valid time", () => {
    const time = parseTime("14:30:00");
    expect(serializeOptional(time)).toBe("14:30:00");
  });

  test("returns undefined for null", () => {
    expect(serializeOptional(null)).toBeUndefined();
  });

  test("returns undefined for undefined", () => {
    expect(serializeOptional(undefined)).toBeUndefined();
  });
});

// =============================================================================
// serialize
// =============================================================================

describe("serialize", () => {
  test("formats datetime to ISO string", () => {
    const dateTime = parseDateTime("2025-01-15T14:30:00");
    expect(serialize(dateTime)).toBe("2025-01-15T14:30:00");
  });

  test("formats datetime with fractional seconds", () => {
    const dateTime = parseDateTime("2025-01-15T14:30:45.123");
    expect(serialize(dateTime)).toBe("2025-01-15T14:30:45.123");
  });

  test("formats midnight datetime", () => {
    const dateTime = parseDateTime("2025-01-15T00:00:00");
    expect(serialize(dateTime)).toBe("2025-01-15T00:00:00");
  });
});

describe("serializeOptional", () => {
  test("formats valid datetime", () => {
    const dateTime = parseDateTime("2025-01-15T14:30:00");
    expect(serializeOptional(dateTime)).toBe("2025-01-15T14:30:00");
  });

  test("returns undefined for null", () => {
    expect(serializeOptional(null)).toBeUndefined();
  });

  test("returns undefined for undefined", () => {
    expect(serializeOptional(undefined)).toBeUndefined();
  });
});

// =============================================================================
// serialize
// =============================================================================

describe("serialize", () => {
  test("formats zoned datetime to ISO string", () => {
    const zoned = parseZoned("2025-01-15T14:30:00-05:00[America/New_York]");
    const result = serialize(zoned);
    expect(result).toContain("2025-01-15T14:30:00");
    expect(result).toContain("[America/New_York]");
  });

  test("formats UTC timezone", () => {
    const zoned = parseZoned("2025-01-15T14:30:00+00:00[UTC]");
    const result = serialize(zoned);
    expect(result).toContain("[UTC]");
  });
});

describe("serializeOptional", () => {
  test("formats valid zoned datetime", () => {
    const zoned = parseZoned("2025-01-15T14:30:00[America/New_York]");
    const result = serializeOptional(zoned);
    expect(result).toContain("[America/New_York]");
  });

  test("returns undefined for null", () => {
    expect(serializeOptional(null)).toBeUndefined();
  });

  test("returns undefined for undefined", () => {
    expect(serializeOptional(undefined)).toBeUndefined();
  });
});

// =============================================================================
// serialize
// =============================================================================

describe("serialize", () => {
  test("formats duration to ISO string", () => {
    const duration = parseDuration("PT1H30M");
    expect(serialize(duration)).toBe("PT1H30M");
  });

  test("formats day duration", () => {
    const duration = parseDuration("P1D");
    expect(serialize(duration)).toBe("P1D");
  });

  test("formats complex duration", () => {
    const duration = parseDuration("P1Y2M3DT4H5M6S");
    expect(serialize(duration)).toBe("P1Y2M3DT4H5M6S");
  });
});

describe("serializeOptional", () => {
  test("formats valid duration", () => {
    const duration = parseDuration("PT1H30M");
    expect(serializeOptional(duration)).toBe("PT1H30M");
  });

  test("returns undefined for null", () => {
    expect(serializeOptional(null)).toBeUndefined();
  });

  test("returns undefined for undefined", () => {
    expect(serializeOptional(undefined)).toBeUndefined();
  });
});

// =============================================================================
// formatDateShort - "Jan 15"
// =============================================================================

describe("formatDateShort", () => {
  test("formats date with short month and day", () => {
    const date = parseDate("2025-01-15");
    expect(formatDateShort(date)).toBe("Jan 15");
  });

  test("formats different months", () => {
    expect(formatDateShort(parseDate("2025-02-28"))).toBe("Feb 28");
    expect(formatDateShort(parseDate("2025-12-25"))).toBe("Dec 25");
  });

  test("formats single-digit days", () => {
    expect(formatDateShort(parseDate("2025-01-05"))).toBe("Jan 5");
  });
});

// =============================================================================
// formatDateShortYear - "Jan 15, 2025"
// =============================================================================

describe("formatDateShortYear", () => {
  test("formats date with short month, day, and year", () => {
    const date = parseDate("2025-01-15");
    expect(formatDateShortYear(date)).toBe("Jan 15, 2025");
  });

  test("formats different years", () => {
    expect(formatDateShortYear(parseDate("2024-06-01"))).toBe("Jun 1, 2024");
    expect(formatDateShortYear(parseDate("2030-12-31"))).toBe("Dec 31, 2030");
  });
});

// =============================================================================
// formatDateMedium - "January 15"
// =============================================================================

describe("formatDateMedium", () => {
  test("formats date with long month and day", () => {
    const date = parseDate("2025-01-15");
    expect(formatDateMedium(date)).toBe("January 15");
  });

  test("formats different months", () => {
    expect(formatDateMedium(parseDate("2025-02-28"))).toBe("February 28");
    expect(formatDateMedium(parseDate("2025-12-25"))).toBe("December 25");
  });
});

// =============================================================================
// formatDateMediumYear - "January 15, 2025"
// =============================================================================

describe("formatDateMediumYear", () => {
  test("formats date with long month, day, and year", () => {
    const date = parseDate("2025-01-15");
    expect(formatDateMediumYear(date)).toBe("January 15, 2025");
  });

  test("formats different years", () => {
    expect(formatDateMediumYear(parseDate("2024-06-01"))).toBe("June 1, 2024");
    expect(formatDateMediumYear(parseDate("2030-12-31"))).toBe("December 31, 2030");
  });
});

// =============================================================================
// formatDateShortWeekday - "Wed, Jan 15"
// =============================================================================

describe("formatDateShortWeekday", () => {
  test("formats date with short weekday, short month, and day", () => {
    const date = parseDate("2025-01-15"); // Wednesday
    expect(formatDateShortWeekday(date)).toBe("Wed, Jan 15");
  });

  test("formats different weekdays", () => {
    expect(formatDateShortWeekday(parseDate("2025-01-13"))).toBe("Mon, Jan 13");
    expect(formatDateShortWeekday(parseDate("2025-01-18"))).toBe("Sat, Jan 18");
    expect(formatDateShortWeekday(parseDate("2025-01-19"))).toBe("Sun, Jan 19");
  });
});

// =============================================================================
// formatDateShortWeekdayYear - "Wed, Jan 15, 2025"
// =============================================================================

describe("formatDateShortWeekdayYear", () => {
  test("formats date with short weekday, short month, day, and year", () => {
    const date = parseDate("2025-01-15"); // Wednesday
    expect(formatDateShortWeekdayYear(date)).toBe("Wed, Jan 15, 2025");
  });

  test("formats different years", () => {
    expect(formatDateShortWeekdayYear(parseDate("2024-01-15"))).toBe("Mon, Jan 15, 2024");
    expect(formatDateShortWeekdayYear(parseDate("2030-01-15"))).toBe("Tue, Jan 15, 2030");
  });
});

// =============================================================================
// formatDateLong - "Wednesday, January 15" (existing)
// =============================================================================

describe("formatDateLong", () => {
  test("formats date with weekday and month", () => {
    const date = parseDate("2025-01-15");
    expect(formatDateLong(date)).toBe("Wednesday, January 15");
  });

  test("formats different weekdays", () => {
    expect(formatDateLong(parseDate("2025-01-13"))).toBe("Monday, January 13");
    expect(formatDateLong(parseDate("2025-01-14"))).toBe("Tuesday, January 14");
    expect(formatDateLong(parseDate("2025-01-17"))).toBe("Friday, January 17");
    expect(formatDateLong(parseDate("2025-01-18"))).toBe("Saturday, January 18");
    expect(formatDateLong(parseDate("2025-01-19"))).toBe("Sunday, January 19");
  });

  test("formats different months", () => {
    expect(formatDateLong(parseDate("2025-02-15"))).toBe("Saturday, February 15");
    expect(formatDateLong(parseDate("2025-12-25"))).toBe("Thursday, December 25");
  });
});

// =============================================================================
// formatDateFull - "Wednesday, January 15, 2025" (existing)
// =============================================================================

describe("formatDateFull", () => {
  test("formats date with weekday, month, and year", () => {
    const date = parseDate("2025-01-15");
    expect(formatDateFull(date)).toBe("Wednesday, January 15, 2025");
  });

  test("formats different years", () => {
    expect(formatDateFull(parseDate("2024-01-15"))).toBe("Monday, January 15, 2024");
    expect(formatDateFull(parseDate("2030-01-15"))).toBe("Tuesday, January 15, 2030");
  });

  test("formats leap year date", () => {
    expect(formatDateFull(parseDate("2024-02-29"))).toBe("Thursday, February 29, 2024");
  });
});

// =============================================================================
// formatDateNumeric - "1/15"
// =============================================================================

describe("formatDateNumeric", () => {
  test("formats date as numeric month/day", () => {
    const date = parseDate("2025-01-15");
    expect(formatDateNumeric(date)).toBe("1/15");
  });

  test("formats different dates", () => {
    expect(formatDateNumeric(parseDate("2025-12-25"))).toBe("12/25");
    expect(formatDateNumeric(parseDate("2025-06-01"))).toBe("6/1");
  });
});

// =============================================================================
// formatDateNumericYear - "1/15/2025"
// =============================================================================

describe("formatDateNumericYear", () => {
  test("formats date as numeric month/day/year", () => {
    const date = parseDate("2025-01-15");
    expect(formatDateNumericYear(date)).toBe("1/15/2025");
  });

  test("formats different years", () => {
    expect(formatDateNumericYear(parseDate("2024-12-25"))).toBe("12/25/2024");
    expect(formatDateNumericYear(parseDate("2030-06-01"))).toBe("6/1/2030");
  });
});

// =============================================================================
// formatMonthYear - "January 2025"
// =============================================================================

describe("formatMonthYear", () => {
  test("formats month and year", () => {
    const date = parseDate("2025-01-15");
    expect(formatMonthYear(date)).toBe("January 2025");
  });

  test("formats different months", () => {
    expect(formatMonthYear(parseDate("2025-06-01"))).toBe("June 2025");
    expect(formatMonthYear(parseDate("2025-12-31"))).toBe("December 2025");
  });
});

// =============================================================================
// formatMonthYearShort - "Jan 2025"
// =============================================================================

describe("formatMonthYearShort", () => {
  test("formats short month and year", () => {
    const date = parseDate("2025-01-15");
    expect(formatMonthYearShort(date)).toBe("Jan 2025");
  });

  test("formats different months", () => {
    expect(formatMonthYearShort(parseDate("2025-06-01"))).toBe("Jun 2025");
    expect(formatMonthYearShort(parseDate("2025-12-31"))).toBe("Dec 2025");
  });
});

// =============================================================================
// formatTime - "2:30 PM"
// =============================================================================

describe("formatTime", () => {
  test("formats afternoon time without leading zero", () => {
    const time = parseTime("14:30:00");
    expect(formatTime(time)).toBe("2:30 PM");
  });

  test("formats morning single-digit hour without leading zero", () => {
    const time = parseTime("09:15:00");
    expect(formatTime(time)).toBe("9:15 AM");
  });

  test("formats midnight as 12:00 AM", () => {
    const time = parseTime("00:00:00");
    expect(formatTime(time)).toBe("12:00 AM");
  });

  test("formats noon as 12:00 PM", () => {
    const time = parseTime("12:00:00");
    expect(formatTime(time)).toBe("12:00 PM");
  });

  test("formats 23:59 as 11:59 PM", () => {
    const time = parseTime("23:59:00");
    expect(formatTime(time)).toBe("11:59 PM");
  });

  test("formats times with zero minutes correctly", () => {
    expect(formatTime(parseTime("08:00:00"))).toBe("8:00 AM");
    expect(formatTime(parseTime("20:00:00"))).toBe("8:00 PM");
  });
});

// =============================================================================
// formatTimePadded - "02:30 PM"
// =============================================================================

describe("formatTimePadded", () => {
  test("formats afternoon time with padded hour", () => {
    const time = parseTime("14:30:00");
    expect(formatTimePadded(time)).toBe("02:30 PM");
  });

  test("formats morning time with padded hour", () => {
    const time = parseTime("09:15:00");
    expect(formatTimePadded(time)).toBe("09:15 AM");
  });

  test("formats midnight", () => {
    const time = parseTime("00:00:00");
    expect(formatTimePadded(time)).toBe("12:00 AM");
  });

  test("formats noon", () => {
    const time = parseTime("12:00:00");
    expect(formatTimePadded(time)).toBe("12:00 PM");
  });

  test("formats end of day", () => {
    const time = parseTime("23:59:00");
    expect(formatTimePadded(time)).toBe("11:59 PM");
  });
});

// =============================================================================
// formatTimeCompact
// =============================================================================

describe("formatTimeCompact", () => {
  test("omits minutes when :00", () => {
    expect(formatTimeCompact(parseTime("14:00:00"))).toBe("2 PM");
    expect(formatTimeCompact(parseTime("08:00:00"))).toBe("8 AM");
    expect(formatTimeCompact(parseTime("20:00:00"))).toBe("8 PM");
  });

  test("includes minutes when non-zero", () => {
    expect(formatTimeCompact(parseTime("14:30:00"))).toBe("2:30 PM");
    expect(formatTimeCompact(parseTime("09:15:00"))).toBe("9:15 AM");
    expect(formatTimeCompact(parseTime("09:05:00"))).toBe("9:05 AM");
  });

  test("formats midnight as 12 AM", () => {
    expect(formatTimeCompact(parseTime("00:00:00"))).toBe("12 AM");
  });

  test("formats noon as 12 PM", () => {
    expect(formatTimeCompact(parseTime("12:00:00"))).toBe("12 PM");
  });

  test("formats 12:30 PM correctly", () => {
    expect(formatTimeCompact(parseTime("12:30:00"))).toBe("12:30 PM");
  });

  test("formats end of day", () => {
    expect(formatTimeCompact(parseTime("23:59:00"))).toBe("11:59 PM");
  });
});

// =============================================================================
// formatDateTimeTime - uses unpadded time
// =============================================================================

describe("formatDateTimeTime", () => {
  test("formats datetime time portion as unpadded", () => {
    const dateTime = parseDateTime("2025-01-15T14:30:00");
    expect(formatDateTimeTime(dateTime)).toBe("2:30 PM");
  });

  test("formats midnight datetime", () => {
    const dateTime = parseDateTime("2025-01-15T00:00:00");
    expect(formatDateTimeTime(dateTime)).toBe("12:00 AM");
  });

  test("formats noon datetime", () => {
    const dateTime = parseDateTime("2025-01-15T12:00:00");
    expect(formatDateTimeTime(dateTime)).toBe("12:00 PM");
  });
});

// =============================================================================
// formatZonedTime - uses unpadded time
// =============================================================================

describe("formatZonedTime", () => {
  test("formats zoned datetime time portion as unpadded", () => {
    const zoned = parseZoned("2025-01-15T14:30:00[America/New_York]");
    expect(formatZonedTime(zoned)).toBe("2:30 PM");
  });

  test("formats midnight zoned datetime", () => {
    const zoned = parseZoned("2025-01-15T00:00:00[UTC]");
    expect(formatZonedTime(zoned)).toBe("12:00 AM");
  });
});

// =============================================================================
// formatInstantTime - uses unpadded time
// =============================================================================

describe("formatInstantTime", () => {
  test("formats instant as local time", () => {
    // Create an instant and format it - the exact output depends on local timezone
    // so we just verify it returns a valid time format
    const instant = parseInstant("2025-01-15T19:30:00Z");
    const result = formatInstantTime(instant);
    // Should match pattern like "2:30 PM" or "7:30 PM" depending on timezone (unpadded)
    expect(result).toMatch(/^\d{1,2}:\d{2}\s[AP]M$/);
  });

  test("formats midnight instant", () => {
    const instant = parseInstant("2025-01-15T00:00:00Z");
    const result = formatInstantTime(instant);
    expect(result).toMatch(/^\d{1,2}:\d{2}\s[AP]M$/);
  });
});

// =============================================================================
// formatRelative
// =============================================================================

describe("formatRelative", () => {
  test('returns "today" for today', () => {
    const todayDate = today();
    expect(formatRelative(todayDate)).toBe("today");
  });

  test('returns "tomorrow" for tomorrow', () => {
    const tomorrow = addDays(today(), 1);
    expect(formatRelative(tomorrow)).toBe("tomorrow");
  });

  test('returns "yesterday" for yesterday', () => {
    const yesterday = subtractDays(today(), 1);
    expect(formatRelative(yesterday)).toBe("yesterday");
  });

  test('returns "in X days" for 2-6 days in future', () => {
    const in2Days = addDays(today(), 2);
    expect(formatRelative(in2Days)).toBe("in 2 days");

    const in6Days = addDays(today(), 6);
    expect(formatRelative(in6Days)).toBe("in 6 days");
  });

  test('returns "X days ago" for 2+ days in past', () => {
    const daysAgo2 = subtractDays(today(), 2);
    expect(formatRelative(daysAgo2)).toBe("2 days ago");

    const daysAgo10 = subtractDays(today(), 10);
    expect(formatRelative(daysAgo10)).toBe("10 days ago");
  });

  test("returns month format for 7+ days in future", () => {
    const in7Days = addDays(today(), 7);
    const result = formatRelative(in7Days);
    // Should be in format like "Jan 22, 2025"
    expect(result).toMatch(/[A-Z][a-z]{2} \d{1,2}, \d{4}/);
  });

  test("formats distant date in month format", () => {
    // Use a date far in the future that will always be > 7 days away
    const futureDate = parseDate("2100-06-15");
    const result = formatRelative(futureDate);
    // Should be in format like "Jun 15, 2100"
    expect(result).toBe("Jun 15, 2100");
  });
});

// =============================================================================
// formatRelativeInstant
// =============================================================================

describe("formatRelativeInstant", () => {
  test('returns "just now" for instant less than 1 minute ago', () => {
    const now = Temporal.Now.instant();
    const result = formatRelativeInstant(now);
    expect(result).toBe("just now");
  });

  test('returns "Xm ago" for instant minutes ago', () => {
    const now = Temporal.Now.instant();
    const fiveMinutesAgo = now.subtract({ minutes: 5 });
    const result = formatRelativeInstant(fiveMinutesAgo);
    expect(result).toBe("5m ago");
  });

  test('returns "Xh ago" for instant hours ago', () => {
    const now = Temporal.Now.instant();
    const twoHoursAgo = now.subtract({ hours: 2 });
    const result = formatRelativeInstant(twoHoursAgo);
    expect(result).toBe("2h ago");
  });

  test('returns "Xd ago" for instant days ago (less than 7)', () => {
    const now = Temporal.Now.instant();
    const threeDaysAgo = now.subtract({ hours: 72 });
    const result = formatRelativeInstant(threeDaysAgo);
    expect(result).toBe("3d ago");
  });

  test("returns date format for instant 7+ days ago", () => {
    const oldInstant = parseInstant("2020-06-15T12:00:00Z");
    const result = formatRelativeInstant(oldInstant);
    expect(result).toBe("Jun 15, 2020");
  });

  test("handles exactly 1 minute ago", () => {
    const now = Temporal.Now.instant();
    const oneMinuteAgo = now.subtract({ minutes: 1 });
    const result = formatRelativeInstant(oneMinuteAgo);
    expect(result).toBe("1m ago");
  });

  test("handles exactly 1 hour ago", () => {
    const now = Temporal.Now.instant();
    const oneHourAgo = now.subtract({ hours: 1 });
    const result = formatRelativeInstant(oneHourAgo);
    expect(result).toBe("1h ago");
  });

  test("handles exactly 1 day ago", () => {
    const now = Temporal.Now.instant();
    const oneDayAgo = now.subtract({ hours: 24 });
    const result = formatRelativeInstant(oneDayAgo);
    expect(result).toBe("1d ago");
  });

  test("handles 6 days ago (boundary before date format)", () => {
    const now = Temporal.Now.instant();
    const sixDaysAgo = now.subtract({ hours: 144 }); // 6 * 24
    const result = formatRelativeInstant(sixDaysAgo);
    expect(result).toBe("6d ago");
  });
});

// =============================================================================
// formatMilliseconds
// =============================================================================

describe("formatMilliseconds", () => {
  test("formats milliseconds under 1 second", () => {
    expect(formatMilliseconds(500)).toBe("500ms");
    expect(formatMilliseconds(1)).toBe("1ms");
    expect(formatMilliseconds(999)).toBe("999ms");
  });

  test("formats exactly 0 milliseconds", () => {
    expect(formatMilliseconds(0)).toBe("0ms");
  });

  test("formats seconds under 1 minute", () => {
    expect(formatMilliseconds(1000)).toBe("1s");
    expect(formatMilliseconds(5000)).toBe("5s");
    expect(formatMilliseconds(59000)).toBe("59s");
  });

  test("formats minutes with remaining seconds", () => {
    expect(formatMilliseconds(65000)).toBe("1m 5s");
    expect(formatMilliseconds(90000)).toBe("1m 30s");
    expect(formatMilliseconds(125000)).toBe("2m 5s");
  });

  test("formats minutes without remaining seconds", () => {
    expect(formatMilliseconds(60000)).toBe("1m");
    expect(formatMilliseconds(120000)).toBe("2m");
    expect(formatMilliseconds(300000)).toBe("5m");
  });

  test("formats large durations", () => {
    expect(formatMilliseconds(3600000)).toBe("60m"); // 1 hour
    expect(formatMilliseconds(3661000)).toBe("61m 1s"); // 1 hour, 1 min, 1 sec
  });

  test("truncates fractional milliseconds to whole seconds", () => {
    // 1500ms = 1.5s, but we show whole seconds only
    expect(formatMilliseconds(1500)).toBe("1s");
    expect(formatMilliseconds(2999)).toBe("2s");
  });
});

// =============================================================================
// formatDurationShort
// =============================================================================

describe("formatDurationShort", () => {
  test("formats minutes", () => {
    expect(formatDurationShort(minutes(1))).toBe("1min");
    expect(formatDurationShort(minutes(5))).toBe("5min");
    expect(formatDurationShort(minutes(15))).toBe("15min");
    expect(formatDurationShort(minutes(30))).toBe("30min");
  });

  test("formats hours", () => {
    expect(formatDurationShort(hours(1))).toBe("1hr");
    expect(formatDurationShort(hours(6))).toBe("6hr");
    expect(formatDurationShort(hours(12))).toBe("12hr");
  });

  test("formats days", () => {
    expect(formatDurationShort(days(1))).toBe("1 day");
    expect(formatDurationShort(days(7))).toBe("7 days");
  });

  test("formats mixed hours and minutes", () => {
    expect(formatDurationShort(Temporal.Duration.from({ hours: 1, minutes: 30 }))).toBe("1hr 30min");
    expect(formatDurationShort(Temporal.Duration.from({ hours: 2, minutes: 15 }))).toBe("2hr 15min");
  });
});

// =============================================================================
// formatRelativeToNow
// =============================================================================

describe("formatRelativeToNow", () => {
  test("formats recent past as 'just now'", () => {
    const instant = Temporal.Now.instant().subtract({ seconds: 30 });
    expect(formatRelativeToNow(instant)).toBe("just now");
  });

  test("formats minutes ago", () => {
    const instant = Temporal.Now.instant().subtract({ minutes: 5 });
    expect(formatRelativeToNow(instant)).toBe("5 minutes ago");
  });

  test("formats 1 minute ago (singular)", () => {
    const instant = Temporal.Now.instant().subtract({ minutes: 1 });
    expect(formatRelativeToNow(instant)).toBe("1 minute ago");
  });

  test("formats hours ago", () => {
    const instant = Temporal.Now.instant().subtract({ hours: 3 });
    expect(formatRelativeToNow(instant)).toBe("3 hours ago");
  });

  test("formats 1 hour ago (singular)", () => {
    const instant = Temporal.Now.instant().subtract({ hours: 1 });
    expect(formatRelativeToNow(instant)).toBe("1 hour ago");
  });

  test("formats days ago", () => {
    const instant = Temporal.Now.instant().subtract({ hours: 48 }); // 2 days
    expect(formatRelativeToNow(instant)).toBe("2 days ago");
  });

  test("formats future times with 'in'", () => {
    const instant = Temporal.Now.instant().add({ hours: 2, minutes: 30 }); // ensure it's clearly over 2 hours
    expect(formatRelativeToNow(instant)).toBe("in 2 hours");
  });

  test("formats weeks ago", () => {
    const instant = Temporal.Now.instant().subtract({ hours: 336 }); // 2 weeks = 14 * 24
    expect(formatRelativeToNow(instant)).toBe("2 weeks ago");
  });

  test("falls back to date format for old timestamps", () => {
    const instant = Temporal.Now.instant().subtract({ hours: 1440 }); // 60 days
    const result = formatRelativeToNow(instant);
    // Should be a date like "Nov 21, 2024"
    expect(result).toMatch(/[A-Z][a-z]{2} \d{1,2}, \d{4}/);
  });
});

// =============================================================================
// formatRelativeToNow boundary tests
// =============================================================================

describe("formatRelativeToNow boundary tests", () => {
  // Freeze time so the offset captured in the test matches the "now" the
  // formatter sees. Without this, time elapsed between the two reads of
  // Temporal.Now.instant() can shift the offset across boundary thresholds.
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-20T12:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  test("returns 'just now' at exactly 59 seconds ago", () => {
    const instant = Temporal.Now.instant().subtract({ seconds: 59 });
    expect(formatRelativeToNow(instant)).toBe("just now");
  });

  test("returns '1 minute ago' at exactly 60 seconds ago", () => {
    const instant = Temporal.Now.instant().subtract({ seconds: 60 });
    expect(formatRelativeToNow(instant)).toBe("1 minute ago");
  });

  test("returns 'in 1 minute' at exactly 60 seconds in future", () => {
    const instant = Temporal.Now.instant().add({ seconds: 60 });
    expect(formatRelativeToNow(instant)).toBe("in 1 minute");
  });

  test("returns '59 minutes ago' at 59m59s ago", () => {
    const instant = Temporal.Now.instant().subtract({ minutes: 59, seconds: 59 });
    expect(formatRelativeToNow(instant)).toBe("59 minutes ago");
  });

  test("returns '1 hour ago' at exactly 60 minutes ago", () => {
    const instant = Temporal.Now.instant().subtract({ minutes: 60 });
    expect(formatRelativeToNow(instant)).toBe("1 hour ago");
  });

  test("returns '23 hours ago' at 23h59m ago", () => {
    const instant = Temporal.Now.instant().subtract({ hours: 23, minutes: 59 });
    expect(formatRelativeToNow(instant)).toBe("23 hours ago");
  });

  test("returns '1 day ago' at exactly 24 hours ago", () => {
    const instant = Temporal.Now.instant().subtract({ hours: 24 });
    expect(formatRelativeToNow(instant)).toBe("1 day ago");
  });

  test("returns '6 days ago' at 6d23h ago", () => {
    const instant = Temporal.Now.instant().subtract({ hours: 167 }); // 6*24 + 23 = 167
    expect(formatRelativeToNow(instant)).toBe("6 days ago");
  });

  test("returns '1 week ago' at exactly 7 days ago", () => {
    const instant = Temporal.Now.instant().subtract({ hours: 168 }); // 7*24 = 168
    expect(formatRelativeToNow(instant)).toBe("1 week ago");
  });

  test("returns date format at 30+ days", () => {
    const instant = Temporal.Now.instant().subtract({ hours: 720 }); // 30 days
    const result = formatRelativeToNow(instant);
    expect(result).toMatch(/[A-Z][a-z]{2} \d{1,2}, \d{4}/);
  });
});

// =============================================================================
// formatDate (pattern-based)
// =============================================================================

describe("formatDate", () => {
  test("formats full month and year", () => {
    const date = parseDate("2025-01-15");
    expect(formatDate(date, "MMMM yyyy")).toBe("January 2025");
  });

  test("formats short month and day", () => {
    const date = parseDate("2025-01-15");
    expect(formatDate(date, "MMM d")).toBe("Jan 15");
  });

  test("formats full weekday, month, day, and year", () => {
    const date = parseDate("2025-01-15");
    expect(formatDate(date, "EEEE, MMMM d, yyyy")).toBe("Wednesday, January 15, 2025");
  });

  test("formats with short weekday", () => {
    const date = parseDate("2025-01-15");
    expect(formatDate(date, "EEE, MMM d")).toBe("Wed, Jan 15");
  });

  test("formats with numeric month and padded day", () => {
    const date = parseDate("2025-01-05");
    expect(formatDate(date, "MM/dd/yyyy")).toBe("01/05/2025");
  });

  test("formats with single digit day", () => {
    const date = parseDate("2025-01-05");
    expect(formatDate(date, "MMM d, yyyy")).toBe("Jan 5, 2025");
  });

  test("formats with padded day", () => {
    const date = parseDate("2025-01-05");
    expect(formatDate(date, "MMM dd, yyyy")).toBe("Jan 05, 2025");
  });

  test("handles different months correctly", () => {
    expect(formatDate(parseDate("2025-12-31"), "MMMM")).toBe("December");
    expect(formatDate(parseDate("2025-02-28"), "MMMM")).toBe("February");
    expect(formatDate(parseDate("2025-06-15"), "MMM")).toBe("Jun");
  });

  test("handles different weekdays correctly", () => {
    expect(formatDate(parseDate("2025-01-13"), "EEEE")).toBe("Monday");
    expect(formatDate(parseDate("2025-01-19"), "EEEE")).toBe("Sunday");
    expect(formatDate(parseDate("2025-01-15"), "EEE")).toBe("Wed");
  });
});

// =============================================================================
// formatInstantDateTime
// =============================================================================

describe("formatInstantDateTime", () => {
  test("formats Instant as date and time in specified timezone", () => {
    const instant = Temporal.Instant.from("2026-01-24T23:30:00Z");
    const formatted = formatInstantDateTime(instant, "America/Los_Angeles");
    expect(formatted).toBe("Jan 24, 2026, 3:30 PM");
  });

  test("formats Instant as date and time in current timezone when timezone not specified", () => {
    const instant = Temporal.Instant.from("2026-01-24T23:30:00Z");
    const formatted = formatInstantDateTime(instant);
    // Result depends on system timezone, just verify it returns a string with date and time
    expect(typeof formatted).toBe("string");
    expect(formatted).toMatch(/Jan \d{1,2}, 2026, \d{1,2}:\d{2} (AM|PM)/);
  });
});

// =============================================================================
// formatInstantShortYear
// =============================================================================

describe("formatInstantShortYear", () => {
  test("formats Instant as short date with year in specified timezone", () => {
    const instant = Temporal.Instant.from("2026-01-24T08:00:00Z");
    const formatted = formatInstantShortYear(instant, "America/New_York");
    expect(formatted).toBe("Jan 24, 2026");
  });

  test("handles date boundary crossing due to timezone", () => {
    // 1 AM UTC = Jan 23, 5 PM PST (previous day)
    const instant = Temporal.Instant.from("2026-01-24T01:00:00Z");
    const formatted = formatInstantShortYear(instant, "America/Los_Angeles");
    expect(formatted).toBe("Jan 23, 2026");
  });
});

// =============================================================================
// Type-specific serializers
// =============================================================================

describe("serializeInstant", () => {
  test("serializes instant to ISO string", () => {
    const instant = parseInstant("2025-01-15T14:30:00Z");
    expect(serializeInstant(instant)).toBe("2025-01-15T14:30:00Z");
  });

  test("normalizes offset to UTC", () => {
    const instant = parseInstant("2025-01-15T14:30:00+05:30");
    expect(serializeInstant(instant)).toBe("2025-01-15T09:00:00Z");
  });
});

describe("serializeDate", () => {
  test("serializes date to ISO string", () => {
    const date = parseDate("2025-01-15");
    expect(serializeDate(date)).toBe("2025-01-15");
  });

  test("handles leap year date", () => {
    const date = parseDate("2024-02-29");
    expect(serializeDate(date)).toBe("2024-02-29");
  });
});

describe("serializeDateTime", () => {
  test("serializes datetime to ISO string", () => {
    const dt = parseDateTime("2025-01-15T14:30:00");
    expect(serializeDateTime(dt)).toBe("2025-01-15T14:30:00");
  });

  test("preserves fractional seconds", () => {
    const dt = parseDateTime("2025-01-15T14:30:00.123");
    expect(serializeDateTime(dt)).toBe("2025-01-15T14:30:00.123");
  });
});

describe("serializeTime", () => {
  test("serializes time to ISO string", () => {
    const time = parseTime("14:30:00");
    expect(serializeTime(time)).toBe("14:30:00");
  });

  test("handles midnight", () => {
    const time = parseTime("00:00:00");
    expect(serializeTime(time)).toBe("00:00:00");
  });
});

describe("serializeZonedDateTime", () => {
  test("serializes zoned datetime to ISO string with timezone", () => {
    const zoned = parseZoned("2025-01-15T14:30:00-05:00[America/New_York]");
    expect(serializeZonedDateTime(zoned)).toBe("2025-01-15T14:30:00-05:00[America/New_York]");
  });
});

describe("serializeDuration", () => {
  test("serializes duration to ISO string", () => {
    const duration = parseDuration("PT1H30M");
    expect(serializeDuration(duration)).toBe("PT1H30M");
  });

  test("handles days and hours", () => {
    const duration = parseDuration("P2DT5H");
    expect(serializeDuration(duration)).toBe("P2DT5H");
  });
});
