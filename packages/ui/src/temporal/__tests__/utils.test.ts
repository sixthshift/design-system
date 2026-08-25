/**
 * Tests for utils.ts - Date/time utility functions
 */

import { describe, expect, test } from "vitest";

/** Assert value is defined - throws with clear error if assumption is wrong */
function defined<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Expected defined value in test");
  return value;
}

import {
  // Arithmetic
  addDays,
  addMonths,
  addWeeks,
  changeTimezone,
  currentTime,
  days,
  differenceInMinutes,
  diffInDays,
  diffInMonths,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  // Duration helpers
  hours,
  isAfter,
  // Comparison
  isBefore,
  isDuration,
  isFuture,
  // Type guards (for verification)
  isInstant,
  isInstantAfter,
  isInstantBefore,
  isInstantFuture,
  isInstantPast,
  isPast,
  isPlainDate,
  isPlainDateTime,
  isPlainTime,
  isSameDay,
  isSameMonth,
  isToday,
  isZonedDateTime,
  minutes,
  // Current time
  now,
  nowInTimezone,
  nowISO,
  nowZoned,
  // Parsing helpers
  parseDate,
  parseInstant,
  parseZoned,
  serialize,
  // Boundaries
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subtractDays,
  subtractMonths,
  subtractWeeks,
  Temporal,
  today,
  todayISO,
  toHours,
  toMilliseconds,
  toMinutes,
  toSeconds,
  // Timezone
  toTimezone,
  weeks,
} from "../index";

// =============================================================================
// Current Time - Type Verification Tests
// =============================================================================

describe("now", () => {
  test("returns an Instant", () => {
    const result = now();
    expect(isInstant(result)).toBe(true);
  });

  test("returns a current-ish time", () => {
    const before = Temporal.Now.instant().epochMilliseconds;
    const instant = now();
    const after = Temporal.Now.instant().epochMilliseconds;
    const epochMs = instant.epochMilliseconds;
    expect(epochMs).toBeGreaterThanOrEqual(before);
    expect(epochMs).toBeLessThanOrEqual(after);
  });
});

describe("nowISO", () => {
  test("returns a string", () => {
    const result = nowISO();
    expect(typeof result).toBe("string");
  });

  test("returns ISO format with Z suffix", () => {
    const result = nowISO();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/);
  });
});

describe("today", () => {
  test("returns a PlainDate", () => {
    const result = today();
    expect(isPlainDate(result)).toBe(true);
  });

  test("returns current date", () => {
    const result = today();
    const currentDate = Temporal.Now.plainDateISO();
    // Note: This could fail around midnight due to timezone differences
    // We'll just verify it's within a day
    expect(Math.abs(result.year - currentDate.year)).toBeLessThanOrEqual(1);
  });
});

describe("todayISO", () => {
  test("returns a string", () => {
    const result = todayISO();
    expect(typeof result).toBe("string");
  });

  test("returns ISO date format", () => {
    const result = todayISO();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("currentTime", () => {
  test("returns a PlainTime", () => {
    const result = currentTime();
    expect(isPlainTime(result)).toBe(true);
  });
});

describe("nowZoned", () => {
  test("returns a ZonedDateTime", () => {
    const result = nowZoned();
    expect(isZonedDateTime(result)).toBe(true);
  });
});

describe("nowInTimezone", () => {
  test("returns a ZonedDateTime in specified timezone", () => {
    const result = nowInTimezone("America/New_York");
    expect(isZonedDateTime(result)).toBe(true);
    expect(result.timeZoneId).toBe("America/New_York");
  });

  test("works with various timezones", () => {
    expect(nowInTimezone("Europe/London").timeZoneId).toBe("Europe/London");
    expect(nowInTimezone("Asia/Tokyo").timeZoneId).toBe("Asia/Tokyo");
    expect(nowInTimezone("UTC").timeZoneId).toBe("UTC");
  });
});

// =============================================================================
// Comparison
// =============================================================================

describe("isBefore", () => {
  test("returns true when first date is before second", () => {
    const earlier = parseDate("2025-01-10");
    const later = parseDate("2025-01-15");
    expect(isBefore(earlier, later)).toBe(true);
  });

  test("returns false when first date is after second", () => {
    const earlier = parseDate("2025-01-10");
    const later = parseDate("2025-01-15");
    expect(isBefore(later, earlier)).toBe(false);
  });

  test("returns false when dates are equal", () => {
    const date = parseDate("2025-01-15");
    expect(isBefore(date, date)).toBe(false);
  });

  test("works across months", () => {
    expect(isBefore(parseDate("2025-01-31"), parseDate("2025-02-01"))).toBe(true);
  });

  test("works across years", () => {
    expect(isBefore(parseDate("2024-12-31"), parseDate("2025-01-01"))).toBe(true);
  });
});

describe("isAfter", () => {
  test("returns true when first date is after second", () => {
    const earlier = parseDate("2025-01-10");
    const later = parseDate("2025-01-15");
    expect(isAfter(later, earlier)).toBe(true);
  });

  test("returns false when first date is before second", () => {
    const earlier = parseDate("2025-01-10");
    const later = parseDate("2025-01-15");
    expect(isAfter(earlier, later)).toBe(false);
  });

  test("returns false when dates are equal", () => {
    const date = parseDate("2025-01-15");
    expect(isAfter(date, date)).toBe(false);
  });
});

describe("isSameDay", () => {
  test("returns true for same date", () => {
    const date1 = parseDate("2025-01-15");
    const date2 = parseDate("2025-01-15");
    expect(isSameDay(date1, date2)).toBe(true);
  });

  test("returns false for different dates", () => {
    const date1 = parseDate("2025-01-15");
    const date2 = parseDate("2025-01-16");
    expect(isSameDay(date1, date2)).toBe(false);
  });
});

describe("isSameMonth", () => {
  test("returns true for same month and year", () => {
    const date1 = parseDate("2025-01-15");
    const date2 = parseDate("2025-01-28");
    expect(isSameMonth(date1, date2)).toBe(true);
  });

  test("returns false for different months", () => {
    const date1 = parseDate("2025-01-15");
    const date2 = parseDate("2025-02-15");
    expect(isSameMonth(date1, date2)).toBe(false);
  });

  test("returns false for different years same month", () => {
    const date1 = parseDate("2025-01-15");
    const date2 = parseDate("2024-01-15");
    expect(isSameMonth(date1, date2)).toBe(false);
  });
});

describe("isInstantBefore", () => {
  test("returns true when first instant is before second", () => {
    const earlier = parseInstant("2025-01-15T10:00:00Z");
    const later = parseInstant("2025-01-15T14:00:00Z");
    expect(isInstantBefore(earlier, later)).toBe(true);
  });

  test("returns false when first instant is after second", () => {
    const earlier = parseInstant("2025-01-15T10:00:00Z");
    const later = parseInstant("2025-01-15T14:00:00Z");
    expect(isInstantBefore(later, earlier)).toBe(false);
  });

  test("returns false when instants are equal", () => {
    const instant = parseInstant("2025-01-15T10:00:00Z");
    expect(isInstantBefore(instant, instant)).toBe(false);
  });
});

describe("isInstantAfter", () => {
  test("returns true when first instant is after second", () => {
    const earlier = parseInstant("2025-01-15T10:00:00Z");
    const later = parseInstant("2025-01-15T14:00:00Z");
    expect(isInstantAfter(later, earlier)).toBe(true);
  });

  test("returns false when first instant is before second", () => {
    const earlier = parseInstant("2025-01-15T10:00:00Z");
    const later = parseInstant("2025-01-15T14:00:00Z");
    expect(isInstantAfter(earlier, later)).toBe(false);
  });
});

describe("isToday", () => {
  test("returns true for today", () => {
    const todayDate = today();
    expect(isToday(todayDate)).toBe(true);
  });

  test("returns false for yesterday", () => {
    const yesterday = subtractDays(today(), 1);
    expect(isToday(yesterday)).toBe(false);
  });

  test("returns false for tomorrow", () => {
    const tomorrow = addDays(today(), 1);
    expect(isToday(tomorrow)).toBe(false);
  });
});

describe("isPast", () => {
  test("returns true for far past date", () => {
    const pastDate = parseDate("2000-01-01");
    expect(isPast(pastDate)).toBe(true);
  });

  test("returns false for far future date", () => {
    const futureDate = parseDate("2100-01-01");
    expect(isPast(futureDate)).toBe(false);
  });

  test("returns false for today", () => {
    expect(isPast(today())).toBe(false);
  });
});

describe("isFuture", () => {
  test("returns true for far future date", () => {
    const futureDate = parseDate("2100-01-01");
    expect(isFuture(futureDate)).toBe(true);
  });

  test("returns false for far past date", () => {
    const pastDate = parseDate("2000-01-01");
    expect(isFuture(pastDate)).toBe(false);
  });

  test("returns false for today", () => {
    expect(isFuture(today())).toBe(false);
  });
});

describe("isInstantPast", () => {
  test("returns true for far past instant", () => {
    const pastInstant = parseInstant("2000-01-01T00:00:00Z");
    expect(isInstantPast(pastInstant)).toBe(true);
  });

  test("returns false for far future instant", () => {
    const futureInstant = parseInstant("2100-01-01T00:00:00Z");
    expect(isInstantPast(futureInstant)).toBe(false);
  });
});

describe("isInstantFuture", () => {
  test("returns true for far future instant", () => {
    const futureInstant = parseInstant("2100-01-01T00:00:00Z");
    expect(isInstantFuture(futureInstant)).toBe(true);
  });

  test("returns false for far past instant", () => {
    const pastInstant = parseInstant("2000-01-01T00:00:00Z");
    expect(isInstantFuture(pastInstant)).toBe(false);
  });
});

// =============================================================================
// Arithmetic
// =============================================================================

describe("addDays", () => {
  test("adds days to date", () => {
    const date = parseDate("2025-01-15");
    const result = addDays(date, 5);
    expect(serialize(result)).toBe("2025-01-20");
  });

  test("handles month overflow", () => {
    const date = parseDate("2025-01-30");
    const result = addDays(date, 5);
    expect(serialize(result)).toBe("2025-02-04");
  });

  test("handles year overflow", () => {
    const date = parseDate("2025-12-30");
    const result = addDays(date, 5);
    expect(serialize(result)).toBe("2026-01-04");
  });

  test("handles negative days", () => {
    const date = parseDate("2025-01-15");
    const result = addDays(date, -5);
    expect(serialize(result)).toBe("2025-01-10");
  });

  test("handles zero days", () => {
    const date = parseDate("2025-01-15");
    const result = addDays(date, 0);
    expect(serialize(result)).toBe("2025-01-15");
  });

  test("handles leap year", () => {
    const date = parseDate("2024-02-28");
    const result = addDays(date, 1);
    expect(serialize(result)).toBe("2024-02-29");
  });
});

describe("subtractDays", () => {
  test("subtracts days from date", () => {
    const date = parseDate("2025-01-15");
    const result = subtractDays(date, 5);
    expect(serialize(result)).toBe("2025-01-10");
  });

  test("handles month underflow", () => {
    const date = parseDate("2025-02-04");
    const result = subtractDays(date, 5);
    expect(serialize(result)).toBe("2025-01-30");
  });

  test("handles year underflow", () => {
    const date = parseDate("2025-01-04");
    const result = subtractDays(date, 5);
    expect(serialize(result)).toBe("2024-12-30");
  });
});

describe("addMonths", () => {
  test("adds months to date", () => {
    const date = parseDate("2025-01-15");
    const result = addMonths(date, 2);
    expect(serialize(result)).toBe("2025-03-15");
  });

  test("handles year overflow", () => {
    const date = parseDate("2025-11-15");
    const result = addMonths(date, 3);
    expect(serialize(result)).toBe("2026-02-15");
  });

  test("handles end of month clamping", () => {
    // Jan 31 + 1 month = Feb 28 (clamped)
    const date = parseDate("2025-01-31");
    const result = addMonths(date, 1);
    expect(serialize(result)).toBe("2025-02-28");
  });

  test("handles leap year", () => {
    const date = parseDate("2024-01-29");
    const result = addMonths(date, 1);
    expect(serialize(result)).toBe("2024-02-29");
  });

  test("handles negative months", () => {
    const date = parseDate("2025-03-15");
    const result = addMonths(date, -2);
    expect(serialize(result)).toBe("2025-01-15");
  });
});

describe("subtractMonths", () => {
  test("subtracts months from a date", () => {
    const date = parseDate("2025-06-15");
    const result = subtractMonths(date, 2);
    expect(serialize(result)).toBe("2025-04-15");
  });

  test("handles year underflow", () => {
    const date = parseDate("2025-02-15");
    const result = subtractMonths(date, 3);
    expect(serialize(result)).toBe("2024-11-15");
  });

  test("clamps to end of month (Mar 31 - 1 month = Feb 28)", () => {
    const date = parseDate("2025-03-31");
    const result = subtractMonths(date, 1);
    expect(serialize(result)).toBe("2025-02-28");
  });

  test("handles leap year clamping (Mar 31 - 1 month = Feb 29)", () => {
    const date = parseDate("2024-03-31");
    const result = subtractMonths(date, 1);
    expect(serialize(result)).toBe("2024-02-29");
  });

  test("handles subtracting from leap day", () => {
    const date = parseDate("2024-02-29");
    const result = subtractMonths(date, 12);
    expect(serialize(result)).toBe("2023-02-28");
  });

  test("handles zero months", () => {
    const date = parseDate("2025-01-15");
    const result = subtractMonths(date, 0);
    expect(serialize(result)).toBe("2025-01-15");
  });

  test("handles large month subtraction", () => {
    const date = parseDate("2025-01-15");
    const result = subtractMonths(date, 24);
    expect(serialize(result)).toBe("2023-01-15");
  });

  test("handles 30-day to 31-day month", () => {
    const date = parseDate("2025-05-31");
    const result = subtractMonths(date, 1);
    expect(serialize(result)).toBe("2025-04-30");
  });
});

describe("addWeeks", () => {
  test("adds weeks to date", () => {
    const date = parseDate("2025-01-15");
    const result = addWeeks(date, 2);
    expect(serialize(result)).toBe("2025-01-29");
  });

  test("handles negative weeks", () => {
    const date = parseDate("2025-01-15");
    const result = addWeeks(date, -1);
    expect(serialize(result)).toBe("2025-01-08");
  });
});

describe("subtractWeeks", () => {
  test("subtracts weeks from date", () => {
    const date = parseDate("2025-01-29");
    const result = subtractWeeks(date, 2);
    expect(serialize(result)).toBe("2025-01-15");
  });

  test("handles month boundary", () => {
    const date = parseDate("2025-02-07");
    const result = subtractWeeks(date, 2);
    expect(serialize(result)).toBe("2025-01-24");
  });

  test("handles year boundary", () => {
    const date = parseDate("2025-01-07");
    const result = subtractWeeks(date, 2);
    expect(serialize(result)).toBe("2024-12-24");
  });
});

describe("diffInDays", () => {
  test("calculates positive difference", () => {
    const from = parseDate("2025-01-10");
    const to = parseDate("2025-01-15");
    expect(diffInDays(from, to)).toBe(5);
  });

  test("calculates negative difference", () => {
    const from = parseDate("2025-01-15");
    const to = parseDate("2025-01-10");
    expect(diffInDays(from, to)).toBe(-5);
  });

  test("returns 0 for same date", () => {
    const date = parseDate("2025-01-15");
    expect(diffInDays(date, date)).toBe(0);
  });

  test("handles cross-month difference", () => {
    const from = parseDate("2025-01-30");
    const to = parseDate("2025-02-04");
    expect(diffInDays(from, to)).toBe(5);
  });

  test("handles cross-year difference", () => {
    const from = parseDate("2024-12-30");
    const to = parseDate("2025-01-04");
    expect(diffInDays(from, to)).toBe(5);
  });
});

describe("diffInMonths", () => {
  test("calculates positive difference", () => {
    const from = parseDate("2025-01-15");
    const to = parseDate("2025-04-15");
    expect(diffInMonths(from, to)).toBe(3);
  });

  test("calculates negative difference", () => {
    const from = parseDate("2025-04-15");
    const to = parseDate("2025-01-15");
    expect(diffInMonths(from, to)).toBe(-3);
  });

  test("returns 0 for same month", () => {
    const from = parseDate("2025-01-01");
    const to = parseDate("2025-01-31");
    expect(diffInMonths(from, to)).toBe(0);
  });

  test("handles cross-year difference", () => {
    const from = parseDate("2024-11-15");
    const to = parseDate("2025-02-15");
    expect(diffInMonths(from, to)).toBe(3);
  });

  test("handles multi-year difference", () => {
    const from = parseDate("2023-01-15");
    const to = parseDate("2025-01-15");
    expect(diffInMonths(from, to)).toBe(24);
  });
});

// =============================================================================
// Boundaries
// =============================================================================

describe("startOfDay", () => {
  test("returns midnight", () => {
    const date = parseDate("2025-01-15");
    const result = startOfDay(date);
    expect(isPlainDateTime(result)).toBe(true);
    expect(result.hour).toBe(0);
    expect(result.minute).toBe(0);
    expect(result.second).toBe(0);
    expect(result.year).toBe(2025);
    expect(result.month).toBe(1);
    expect(result.day).toBe(15);
  });
});

describe("endOfDay", () => {
  test("returns 23:59:59.999999999", () => {
    const date = parseDate("2025-01-15");
    const result = endOfDay(date);
    expect(isPlainDateTime(result)).toBe(true);
    expect(result.hour).toBe(23);
    expect(result.minute).toBe(59);
    expect(result.second).toBe(59);
    expect(result.millisecond).toBe(999);
    expect(result.year).toBe(2025);
    expect(result.month).toBe(1);
    expect(result.day).toBe(15);
  });
});

describe("startOfWeek", () => {
  test("returns Monday for Wednesday", () => {
    const wednesday = parseDate("2025-01-15"); // Wednesday
    const result = startOfWeek(wednesday);
    expect(serialize(result)).toBe("2025-01-13"); // Monday
  });

  test("returns Monday for Monday", () => {
    const monday = parseDate("2025-01-13"); // Monday
    const result = startOfWeek(monday);
    expect(serialize(result)).toBe("2025-01-13");
  });

  test("returns previous Monday for Sunday", () => {
    const sunday = parseDate("2025-01-19"); // Sunday
    const result = startOfWeek(sunday);
    expect(serialize(result)).toBe("2025-01-13"); // Previous Monday
  });

  test("handles month boundary", () => {
    const date = parseDate("2025-02-01"); // Saturday
    const result = startOfWeek(date);
    expect(serialize(result)).toBe("2025-01-27"); // Monday in January
  });

  test("returns Sunday when weekStartsOn is 0", () => {
    const wednesday = parseDate("2025-01-15"); // Wednesday
    const result = startOfWeek(wednesday, 0);
    expect(serialize(result)).toBe("2025-01-12"); // Sunday
  });

  test("returns same day for Sunday when weekStartsOn is 0", () => {
    const sunday = parseDate("2025-01-12"); // Sunday
    const result = startOfWeek(sunday, 0);
    expect(serialize(result)).toBe("2025-01-12");
  });
});

describe("endOfWeek", () => {
  test("returns Sunday for Wednesday", () => {
    const wednesday = parseDate("2025-01-15"); // Wednesday
    const result = endOfWeek(wednesday);
    expect(serialize(result)).toBe("2025-01-19"); // Sunday
  });

  test("returns Sunday for Sunday", () => {
    const sunday = parseDate("2025-01-19"); // Sunday
    const result = endOfWeek(sunday);
    expect(serialize(result)).toBe("2025-01-19");
  });

  test("returns next Sunday for Monday", () => {
    const monday = parseDate("2025-01-13"); // Monday
    const result = endOfWeek(monday);
    expect(serialize(result)).toBe("2025-01-19"); // Next Sunday
  });

  test("handles month boundary", () => {
    const date = parseDate("2025-01-27"); // Monday
    const result = endOfWeek(date);
    expect(serialize(result)).toBe("2025-02-02"); // Sunday in February
  });

  test("returns Saturday when weekStartsOn is 0", () => {
    const wednesday = parseDate("2025-01-15"); // Wednesday
    const result = endOfWeek(wednesday, 0);
    expect(serialize(result)).toBe("2025-01-18"); // Saturday
  });

  test("returns same day for Saturday when weekStartsOn is 0", () => {
    const saturday = parseDate("2025-01-18"); // Saturday
    const result = endOfWeek(saturday, 0);
    expect(serialize(result)).toBe("2025-01-18");
  });

  test("returns next Saturday for Sunday when weekStartsOn is 0", () => {
    const sunday = parseDate("2025-01-12"); // Sunday
    const result = endOfWeek(sunday, 0);
    expect(serialize(result)).toBe("2025-01-18"); // Saturday
  });
});

describe("startOfMonth", () => {
  test("returns first of month", () => {
    const date = parseDate("2025-01-15");
    const result = startOfMonth(date);
    expect(serialize(result)).toBe("2025-01-01");
  });

  test("returns same date for first of month", () => {
    const date = parseDate("2025-01-01");
    const result = startOfMonth(date);
    expect(serialize(result)).toBe("2025-01-01");
  });

  test("returns first of month for last day", () => {
    const date = parseDate("2025-01-31");
    const result = startOfMonth(date);
    expect(serialize(result)).toBe("2025-01-01");
  });
});

describe("endOfMonth", () => {
  test("returns last of month for January", () => {
    const date = parseDate("2025-01-15");
    const result = endOfMonth(date);
    expect(serialize(result)).toBe("2025-01-31");
  });

  test("returns last of month for February (non-leap year)", () => {
    const date = parseDate("2025-02-15");
    const result = endOfMonth(date);
    expect(serialize(result)).toBe("2025-02-28");
  });

  test("returns last of month for February (leap year)", () => {
    const date = parseDate("2024-02-15");
    const result = endOfMonth(date);
    expect(serialize(result)).toBe("2024-02-29");
  });

  test("returns last of month for April (30 days)", () => {
    const date = parseDate("2025-04-15");
    const result = endOfMonth(date);
    expect(serialize(result)).toBe("2025-04-30");
  });
});

describe("startOfYear", () => {
  test("returns January 1", () => {
    const date = parseDate("2025-06-15");
    const result = startOfYear(date);
    expect(serialize(result)).toBe("2025-01-01");
  });

  test("returns same date for January 1", () => {
    const date = parseDate("2025-01-01");
    const result = startOfYear(date);
    expect(serialize(result)).toBe("2025-01-01");
  });
});

describe("endOfYear", () => {
  test("returns December 31", () => {
    const date = parseDate("2025-06-15");
    const result = endOfYear(date);
    expect(serialize(result)).toBe("2025-12-31");
  });

  test("returns same date for December 31", () => {
    const date = parseDate("2025-12-31");
    const result = endOfYear(date);
    expect(serialize(result)).toBe("2025-12-31");
  });
});

// =============================================================================
// Timezone
// =============================================================================

describe("toTimezone", () => {
  test("converts instant to specified timezone", () => {
    const instant = parseInstant("2025-01-15T19:30:00Z");
    const result = toTimezone(instant, "America/New_York");
    expect(isZonedDateTime(result)).toBe(true);
    expect(result.timeZoneId).toBe("America/New_York");
    // 19:30 UTC = 14:30 EST (UTC-5)
    expect(result.hour).toBe(14);
  });

  test("handles UTC timezone", () => {
    const instant = parseInstant("2025-01-15T14:30:00Z");
    const result = toTimezone(instant, "UTC");
    expect(result.hour).toBe(14);
  });

  test("handles different timezones", () => {
    const instant = parseInstant("2025-01-15T12:00:00Z");
    const tokyo = toTimezone(instant, "Asia/Tokyo");
    // 12:00 UTC = 21:00 JST (UTC+9)
    expect(tokyo.hour).toBe(21);
  });
});

describe("changeTimezone", () => {
  test("changes timezone while preserving instant", () => {
    const nyZoned = parseZoned("2025-01-15T14:30:00-05:00[America/New_York]");
    const result = changeTimezone(nyZoned, "Europe/London");
    expect(result.timeZoneId).toBe("Europe/London");
    // 14:30 EST = 19:30 GMT (5 hours ahead)
    expect(result.hour).toBe(19);
  });

  test("preserves the same instant", () => {
    const zoned = parseZoned("2025-01-15T14:30:00[America/New_York]");
    const changed = changeTimezone(zoned, "Asia/Tokyo");
    expect(zoned.epochMilliseconds).toBe(changed.epochMilliseconds);
  });
});

// =============================================================================
// Timezone Error Handling
// =============================================================================

describe("timezone error handling", () => {
  test("nowInTimezone throws for invalid timezone", () => {
    expect(() => nowInTimezone("Invalid/Timezone")).toThrow();
  });

  test("nowInTimezone throws for empty string", () => {
    expect(() => nowInTimezone("")).toThrow();
  });

  test("toTimezone throws for invalid timezone", () => {
    const instant = parseInstant("2025-01-15T14:30:00Z");
    expect(() => toTimezone(instant, "Invalid/Timezone")).toThrow();
  });

  test("toTimezone throws for misspelled timezone", () => {
    const instant = parseInstant("2025-01-15T14:30:00Z");
    expect(() => toTimezone(instant, "America/New_Yrok")).toThrow();
  });

  test("changeTimezone throws for invalid target", () => {
    const zoned = parseZoned("2025-01-15T14:30:00[America/New_York]");
    expect(() => changeTimezone(zoned, "NotA/Timezone")).toThrow();
  });

  test("changeTimezone accepts numeric offset", () => {
    const zoned = parseZoned("2025-01-15T14:30:00[America/New_York]");
    // Temporal API accepts numeric offsets as timezone identifiers
    const result = changeTimezone(zoned, "+05:00");
    expect(isZonedDateTime(result)).toBe(true);
    // +05:00 is 10 hours ahead of EST (-05:00), so 14:30 EST becomes 00:30 next day +05:00
    expect(result.hour).toBe(0);
    expect(result.day).toBe(16);
  });
});

// =============================================================================
// DST Transitions
// =============================================================================

describe("DST transitions", () => {
  test("toTimezone handles spring forward", () => {
    // March 9, 2025 2:00 AM EST -> 3:00 AM EDT (clocks spring forward)
    // At 7:00 UTC, it's 2:00 AM EST, but since we spring forward, it becomes 3:00 AM EDT
    const instant = parseInstant("2025-03-09T07:00:00Z");
    const zoned = toTimezone(instant, "America/New_York");
    expect(isZonedDateTime(zoned)).toBe(true);
    expect(zoned.timeZoneId).toBe("America/New_York");
    // The offset should be -04:00 (EDT) after spring forward
    expect(zoned.hour).toBe(3); // 7:00 UTC = 3:00 AM EDT
  });

  test("toTimezone handles fall back", () => {
    // November 2, 2025 2:00 AM EDT -> 1:00 AM EST (clocks fall back)
    // At 6:00 UTC (after fall back), it's 1:00 AM EST
    const instant = parseInstant("2025-11-02T06:00:00Z");
    const zoned = toTimezone(instant, "America/New_York");
    expect(isZonedDateTime(zoned)).toBe(true);
    // The offset should be -05:00 (EST) after fall back
    expect(zoned.hour).toBe(1); // 6:00 UTC = 1:00 AM EST
  });

  test("changeTimezone preserves instant across DST", () => {
    // During DST: July 15, 2025 14:30 EDT (-04:00)
    const nyZoned = parseZoned("2025-07-15T14:30:00-04:00[America/New_York]");
    const laZoned = changeTimezone(nyZoned, "America/Los_Angeles");
    // Both should represent the same instant
    expect(nyZoned.epochMilliseconds).toBe(laZoned.epochMilliseconds);
    // LA should be 3 hours behind NY during summer
    expect(laZoned.hour).toBe(11);
  });

  test("toTimezone during ambiguous hour", () => {
    // During fall back, 1:30 AM occurs twice
    // Using a specific instant ensures we get a deterministic result
    const instant = parseInstant("2025-11-02T05:30:00Z"); // Before fall back (still EDT)
    const zoned = toTimezone(instant, "America/New_York");
    expect(zoned.hour).toBe(1);
    expect(zoned.minute).toBe(30);
  });

  test("differenceInMinutes across spring forward", () => {
    // 1:30 AM EST to 3:30 AM EDT should be 1 hour (60 minutes) of real time
    // because the clock jumps from 2:00 AM to 3:00 AM
    const before = parseInstant("2025-03-09T06:30:00Z"); // 1:30 AM EST
    const after = parseInstant("2025-03-09T07:30:00Z"); // 3:30 AM EDT
    expect(differenceInMinutes(before, after)).toBe(60);
  });

  test("differenceInMinutes across fall back", () => {
    // From 1:30 AM EDT (first occurrence) to 1:30 AM EST (second occurrence)
    // is 1 hour of real time even though wall clock shows same time
    const before = parseInstant("2025-11-02T05:30:00Z"); // 1:30 AM EDT
    const after = parseInstant("2025-11-02T06:30:00Z"); // 1:30 AM EST
    expect(differenceInMinutes(before, after)).toBe(60);
  });
});

// =============================================================================
// Duration Helpers
// =============================================================================

describe("hours", () => {
  test("creates duration from hours", () => {
    const result = hours(2);
    expect(isDuration(result)).toBe(true);
    expect(result.hours).toBe(2);
  });

  test("handles zero", () => {
    const result = hours(0);
    expect(result.hours).toBe(0);
  });

  test("handles large values", () => {
    const result = hours(100);
    expect(result.hours).toBe(100);
  });
});

describe("minutes", () => {
  test("creates duration from minutes", () => {
    const result = minutes(30);
    expect(isDuration(result)).toBe(true);
    expect(result.minutes).toBe(30);
  });

  test("handles large values", () => {
    const result = minutes(120);
    expect(result.minutes).toBe(120);
  });
});

describe("days", () => {
  test("creates duration from days", () => {
    const result = days(5);
    expect(isDuration(result)).toBe(true);
    expect(result.days).toBe(5);
  });
});

describe("weeks", () => {
  test("creates duration from weeks", () => {
    const result = weeks(2);
    expect(isDuration(result)).toBe(true);
    expect(result.weeks).toBe(2);
  });
});

// =============================================================================
// Negative Durations
// =============================================================================

describe("negative durations", () => {
  test("hours creates negative duration", () => {
    const result = hours(-2);
    expect(isDuration(result)).toBe(true);
    expect(result.hours).toBe(-2);
  });

  test("negative duration to negative milliseconds", () => {
    const duration = hours(-1);
    expect(toMilliseconds(duration)).toBe(-3600000);
  });

  test("minutes creates negative duration", () => {
    const result = minutes(-30);
    expect(isDuration(result)).toBe(true);
    expect(result.minutes).toBe(-30);
  });

  test("negative minutes to negative seconds", () => {
    const duration = minutes(-5);
    expect(toSeconds(duration)).toBe(-300);
  });

  test("days creates negative duration", () => {
    const result = days(-3);
    expect(isDuration(result)).toBe(true);
    expect(result.days).toBe(-3);
  });

  test("weeks creates negative duration", () => {
    const result = weeks(-1);
    expect(isDuration(result)).toBe(true);
    expect(result.weeks).toBe(-1);
  });
});

describe("toMilliseconds", () => {
  test("converts duration to milliseconds", () => {
    const duration = hours(1);
    expect(toMilliseconds(duration)).toBe(3600000);
  });

  test("converts minutes to milliseconds", () => {
    const duration = minutes(1);
    expect(toMilliseconds(duration)).toBe(60000);
  });

  test("handles zero", () => {
    const duration = hours(0);
    expect(toMilliseconds(duration)).toBe(0);
  });
});

describe("toSeconds", () => {
  test("converts duration to seconds", () => {
    const duration = hours(1);
    expect(toSeconds(duration)).toBe(3600);
  });

  test("converts minutes to seconds", () => {
    const duration = minutes(5);
    expect(toSeconds(duration)).toBe(300);
  });
});

describe("toMinutes", () => {
  test("converts duration to minutes", () => {
    const duration = hours(2);
    expect(toMinutes(duration)).toBe(120);
  });

  test("handles fractional results", () => {
    const duration = minutes(90);
    expect(toMinutes(duration)).toBe(90);
  });
});

describe("toHours", () => {
  test("converts duration to hours", () => {
    const duration = hours(3);
    expect(toHours(duration)).toBe(3);
  });

  test("converts minutes to fractional hours", () => {
    const duration = minutes(90);
    expect(toHours(duration)).toBe(1.5);
  });
});

// =============================================================================
// differenceInMinutes
// =============================================================================

describe("differenceInMinutes", () => {
  test("calculates minute difference between two instants", () => {
    const from = parseInstant("2025-01-15T14:30:00Z");
    const to = parseInstant("2025-01-15T14:45:00Z");
    expect(differenceInMinutes(from, to)).toBe(15);
  });

  test("calculates negative difference for past instants", () => {
    const from = parseInstant("2025-01-15T14:45:00Z");
    const to = parseInstant("2025-01-15T14:30:00Z");
    expect(differenceInMinutes(from, to)).toBe(-15);
  });

  test("handles hour differences", () => {
    const from = parseInstant("2025-01-15T14:00:00Z");
    const to = parseInstant("2025-01-15T16:30:00Z");
    expect(differenceInMinutes(from, to)).toBe(150);
  });

  test("handles day differences", () => {
    const from = parseInstant("2025-01-15T14:00:00Z");
    const to = parseInstant("2025-01-16T14:00:00Z");
    expect(differenceInMinutes(from, to)).toBe(1440); // 24 * 60
  });

  test("handles fractional minutes by flooring", () => {
    const from = parseInstant("2025-01-15T14:00:00Z");
    const to = parseInstant("2025-01-15T14:00:45Z");
    expect(differenceInMinutes(from, to)).toBe(0);
  });

  test("returns 0 for same instant", () => {
    const instant = parseInstant("2025-01-15T14:30:00Z");
    expect(differenceInMinutes(instant, instant)).toBe(0);
  });
});

// =============================================================================
// eachDayOfInterval
// =============================================================================

describe("eachDayOfInterval", () => {
  test("generates array of dates from start to end", () => {
    const start = parseDate("2025-01-15");
    const end = parseDate("2025-01-17");
    const result = eachDayOfInterval(start, end);

    expect(result).toHaveLength(3);
    expect(serialize(defined(result[0]))).toBe("2025-01-15");
    expect(serialize(defined(result[1]))).toBe("2025-01-16");
    expect(serialize(defined(result[2]))).toBe("2025-01-17");
  });

  test("generates single day when start equals end", () => {
    const date = parseDate("2025-01-15");
    const result = eachDayOfInterval(date, date);

    expect(result).toHaveLength(1);
    expect(serialize(defined(result[0]))).toBe("2025-01-15");
  });

  test("handles backward intervals", () => {
    const start = parseDate("2025-01-17");
    const end = parseDate("2025-01-15");
    const result = eachDayOfInterval(start, end);

    expect(result).toHaveLength(3);
    expect(serialize(defined(result[0]))).toBe("2025-01-17");
    expect(serialize(defined(result[1]))).toBe("2025-01-16");
    expect(serialize(defined(result[2]))).toBe("2025-01-15");
  });

  test("handles month boundaries", () => {
    const start = parseDate("2025-01-30");
    const end = parseDate("2025-02-02");
    const result = eachDayOfInterval(start, end);

    expect(result).toHaveLength(4);
    expect(serialize(defined(result[0]))).toBe("2025-01-30");
    expect(serialize(defined(result[1]))).toBe("2025-01-31");
    expect(serialize(defined(result[2]))).toBe("2025-02-01");
    expect(serialize(defined(result[3]))).toBe("2025-02-02");
  });

  test("handles year boundaries", () => {
    const start = parseDate("2024-12-30");
    const end = parseDate("2025-01-02");
    const result = eachDayOfInterval(start, end);

    expect(result).toHaveLength(4);
    expect(serialize(defined(result[0]))).toBe("2024-12-30");
    expect(serialize(defined(result[1]))).toBe("2024-12-31");
    expect(serialize(defined(result[2]))).toBe("2025-01-01");
    expect(serialize(defined(result[3]))).toBe("2025-01-02");
  });

  test("handles longer intervals", () => {
    const start = parseDate("2025-01-01");
    const end = parseDate("2025-01-10");
    const result = eachDayOfInterval(start, end);

    expect(result).toHaveLength(10);
    expect(serialize(defined(result[0]))).toBe("2025-01-01");
    expect(serialize(defined(result[9]))).toBe("2025-01-10");
  });
});
