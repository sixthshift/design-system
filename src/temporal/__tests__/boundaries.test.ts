/**
 * Tests for boundaries.ts - Time period boundary utilities
 */

import { describe, expect, test } from "vitest";
import { endOfDay, endOfMonth, endOfWeek, endOfYear, parseDate, startOfDay, startOfMonth, startOfWeek, startOfYear, Temporal } from "../index";

// =============================================================================
// startOfDay
// =============================================================================

describe("startOfDay", () => {
  test("returns midnight for a given date", () => {
    const date = parseDate("2026-01-15");
    const result = startOfDay(date);
    expect(result.toString()).toBe("2026-01-15T00:00:00");
  });

  test("returns midnight for the last day of the year", () => {
    const date = parseDate("2026-12-31");
    const result = startOfDay(date);
    expect(result.toString()).toBe("2026-12-31T00:00:00");
  });

  test("returns midnight for the first day of the year", () => {
    const date = parseDate("2026-01-01");
    const result = startOfDay(date);
    expect(result.toString()).toBe("2026-01-01T00:00:00");
  });
});

// =============================================================================
// endOfDay
// =============================================================================

describe("endOfDay", () => {
  test("returns 23:59:59.999999999 for a given date", () => {
    const date = parseDate("2026-01-15");
    const result = endOfDay(date);
    expect(result.toString()).toBe("2026-01-15T23:59:59.999999999");
  });

  test("returns the last nanosecond of the last day of the year", () => {
    const date = parseDate("2026-12-31");
    const result = endOfDay(date);
    expect(result.toString()).toBe("2026-12-31T23:59:59.999999999");
  });

  test("includes the correct hour, minute, and second components", () => {
    const date = parseDate("2026-06-15");
    const result = endOfDay(date);
    expect(result.hour).toBe(23);
    expect(result.minute).toBe(59);
    expect(result.second).toBe(59);
    expect(result.millisecond).toBe(999);
    expect(result.microsecond).toBe(999);
    expect(result.nanosecond).toBe(999);
  });
});

// =============================================================================
// startOfWeek (weekStartsOn=1, Monday default)
// =============================================================================

describe("startOfWeek", () => {
  test("returns Monday when the date is a Wednesday (default weekStartsOn=1)", () => {
    const date = parseDate("2026-01-14"); // Wednesday
    const result = startOfWeek(date);
    expect(result.toString()).toBe("2026-01-12"); // Monday
  });

  test("returns the same date when the date is already Monday (default)", () => {
    const date = parseDate("2026-01-12"); // Monday
    const result = startOfWeek(date);
    expect(result.toString()).toBe("2026-01-12");
  });

  test("returns Monday for a Sunday input (default weekStartsOn=1)", () => {
    const date = parseDate("2026-01-18"); // Sunday
    const result = startOfWeek(date);
    expect(result.toString()).toBe("2026-01-12"); // Previous Monday
  });

  test("returns Sunday when weekStartsOn=0 and the date is a Wednesday", () => {
    const date = parseDate("2026-01-14"); // Wednesday
    const result = startOfWeek(date, 0);
    expect(result.toString()).toBe("2026-01-11"); // Sunday
  });

  test("returns the same date when weekStartsOn=0 and the date is a Sunday", () => {
    const date = parseDate("2026-01-11"); // Sunday
    const result = startOfWeek(date, 0);
    expect(result.toString()).toBe("2026-01-11");
  });

  test("returns Sunday for a Saturday input when weekStartsOn=0", () => {
    const date = parseDate("2026-01-17"); // Saturday
    const result = startOfWeek(date, 0);
    expect(result.toString()).toBe("2026-01-11"); // Sunday
  });

  test("crosses a month boundary backward to find the week start", () => {
    const date = parseDate("2026-02-02"); // Monday
    const result = startOfWeek(date);
    expect(result.toString()).toBe("2026-02-02"); // It's already Monday
    // Try a Tuesday in February
    const tue = parseDate("2026-02-03"); // Tuesday
    const result2 = startOfWeek(tue);
    expect(result2.toString()).toBe("2026-02-02"); // Monday
  });

  test("crosses a year boundary backward when week starts in the previous year", () => {
    const date = parseDate("2026-01-02"); // Friday
    const result = startOfWeek(date);
    expect(result.toString()).toBe("2025-12-29"); // Monday
  });
});

// =============================================================================
// endOfWeek (weekStartsOn=1 → ends Sunday; weekStartsOn=0 → ends Saturday)
// =============================================================================

describe("endOfWeek", () => {
  test("returns Sunday when the date is a Wednesday (default weekStartsOn=1)", () => {
    const date = parseDate("2026-01-14"); // Wednesday
    const result = endOfWeek(date);
    expect(result.toString()).toBe("2026-01-18"); // Sunday
  });

  test("returns Sunday when the date is already Sunday (default weekStartsOn=1)", () => {
    const date = parseDate("2026-01-18"); // Sunday
    const result = endOfWeek(date);
    expect(result.toString()).toBe("2026-01-18");
  });

  test("returns Sunday when the date is Monday (default weekStartsOn=1)", () => {
    const date = parseDate("2026-01-12"); // Monday
    const result = endOfWeek(date);
    expect(result.toString()).toBe("2026-01-18"); // Sunday
  });

  test("returns Saturday when weekStartsOn=0 and the date is a Wednesday", () => {
    const date = parseDate("2026-01-14"); // Wednesday
    const result = endOfWeek(date, 0);
    expect(result.toString()).toBe("2026-01-17"); // Saturday
  });

  test("returns Saturday when weekStartsOn=0 and the date is a Sunday", () => {
    const date = parseDate("2026-01-11"); // Sunday
    const result = endOfWeek(date, 0);
    expect(result.toString()).toBe("2026-01-17"); // Saturday
  });

  test("returns Saturday when weekStartsOn=0 and the date is already Saturday", () => {
    const date = parseDate("2026-01-17"); // Saturday
    const result = endOfWeek(date, 0);
    expect(result.toString()).toBe("2026-01-17");
  });

  test("crosses a month boundary forward to find the week end", () => {
    const date = parseDate("2026-01-29"); // Thursday
    const result = endOfWeek(date);
    expect(result.toString()).toBe("2026-02-01"); // Sunday
  });
});

// =============================================================================
// startOfMonth
// =============================================================================

describe("startOfMonth", () => {
  test("returns the first day of the month for a mid-month date", () => {
    const date = parseDate("2026-03-15");
    const result = startOfMonth(date);
    expect(result.toString()).toBe("2026-03-01");
  });

  test("returns the same date when the date is already the first of the month", () => {
    const date = parseDate("2026-07-01");
    const result = startOfMonth(date);
    expect(result.toString()).toBe("2026-07-01");
  });

  test("returns the first day of the month for the last day of the month", () => {
    const date = parseDate("2026-01-31");
    const result = startOfMonth(date);
    expect(result.toString()).toBe("2026-01-01");
  });
});

// =============================================================================
// endOfMonth
// =============================================================================

describe("endOfMonth", () => {
  test("returns the 31st for a 31-day month", () => {
    const date = parseDate("2026-01-15");
    const result = endOfMonth(date);
    expect(result.toString()).toBe("2026-01-31");
  });

  test("returns the 30th for a 30-day month", () => {
    const date = parseDate("2026-04-10");
    const result = endOfMonth(date);
    expect(result.toString()).toBe("2026-04-30");
  });

  test("returns February 28 for a non-leap year", () => {
    const date = parseDate("2025-02-10");
    const result = endOfMonth(date);
    expect(result.toString()).toBe("2025-02-28");
  });

  test("returns February 29 for a leap year", () => {
    const date = parseDate("2024-02-10");
    const result = endOfMonth(date);
    expect(result.toString()).toBe("2024-02-29");
  });

  test("returns the same date when the date is already the last day of the month", () => {
    const date = parseDate("2026-03-31");
    const result = endOfMonth(date);
    expect(result.toString()).toBe("2026-03-31");
  });

  test("returns the correct last day for each month", () => {
    const expectedLastDays: Record<string, string> = {
      "2026-01": "2026-01-31",
      "2026-02": "2026-02-28",
      "2026-03": "2026-03-31",
      "2026-04": "2026-04-30",
      "2026-05": "2026-05-31",
      "2026-06": "2026-06-30",
      "2026-07": "2026-07-31",
      "2026-08": "2026-08-31",
      "2026-09": "2026-09-30",
      "2026-10": "2026-10-31",
      "2026-11": "2026-11-30",
      "2026-12": "2026-12-31",
    };
    for (const [month, expected] of Object.entries(expectedLastDays)) {
      const date = parseDate(`${month}-15`);
      expect(endOfMonth(date).toString()).toBe(expected);
    }
  });
});

// =============================================================================
// startOfYear
// =============================================================================

describe("startOfYear", () => {
  test("returns January 1 for any date in the year", () => {
    const date = parseDate("2026-07-15");
    const result = startOfYear(date);
    expect(result.toString()).toBe("2026-01-01");
  });

  test("returns the same date when the date is already January 1", () => {
    const date = parseDate("2026-01-01");
    const result = startOfYear(date);
    expect(result.toString()).toBe("2026-01-01");
  });

  test("returns January 1 for a December 31 date", () => {
    const date = parseDate("2026-12-31");
    const result = startOfYear(date);
    expect(result.toString()).toBe("2026-01-01");
  });
});

// =============================================================================
// endOfYear
// =============================================================================

describe("endOfYear", () => {
  test("returns December 31 for any date in the year", () => {
    const date = parseDate("2026-03-15");
    const result = endOfYear(date);
    expect(result.toString()).toBe("2026-12-31");
  });

  test("returns the same date when the date is already December 31", () => {
    const date = parseDate("2026-12-31");
    const result = endOfYear(date);
    expect(result.toString()).toBe("2026-12-31");
  });

  test("returns December 31 for a January 1 date", () => {
    const date = parseDate("2026-01-01");
    const result = endOfYear(date);
    expect(result.toString()).toBe("2026-12-31");
  });
});

// =============================================================================
// startOfWeek / endOfWeek across all seven week starts
// =============================================================================

describe("startOfWeek across every weekStartsOn", () => {
  // 2026-01-14 is a Wednesday. Every week start must yield a 7-day window that
  // begins on the requested weekday and still contains the input date.
  const wednesday = parseDate("2026-01-14");

  const cases = [
    [0, "2026-01-11", "2026-01-17"], // Sunday
    [1, "2026-01-12", "2026-01-18"], // Monday
    [2, "2026-01-13", "2026-01-19"], // Tuesday
    [3, "2026-01-14", "2026-01-20"], // Wednesday
    [4, "2026-01-08", "2026-01-14"], // Thursday
    [5, "2026-01-09", "2026-01-15"], // Friday
    [6, "2026-01-10", "2026-01-16"], // Saturday
  ] as const;

  test.each(cases)("weekStartsOn=%i starts the week on %s", (weekStartsOn, expectedStart) => {
    expect(startOfWeek(wednesday, weekStartsOn).toString()).toBe(expectedStart);
  });

  test.each(cases)("weekStartsOn=%i ends the week on %s", (weekStartsOn, _start, expectedEnd) => {
    expect(endOfWeek(wednesday, weekStartsOn).toString()).toBe(expectedEnd);
  });

  test.each(cases)("weekStartsOn=%i spans exactly 7 days", (weekStartsOn) => {
    const start = startOfWeek(wednesday, weekStartsOn);
    const end = endOfWeek(wednesday, weekStartsOn);
    expect(start.until(end).days + 1).toBe(7);
  });

  test.each(cases)("weekStartsOn=%i produces a window containing the input date", (weekStartsOn) => {
    const start = startOfWeek(wednesday, weekStartsOn);
    const end = endOfWeek(wednesday, weekStartsOn);
    expect(Temporal.PlainDate.compare(wednesday, start)).toBeGreaterThanOrEqual(0);
    expect(Temporal.PlainDate.compare(wednesday, end)).toBeLessThanOrEqual(0);
  });

  test("a date already on the week start is returned unchanged for every value", () => {
    // Walk a full week so each weekday gets exercised as its own week start.
    for (let offset = 0; offset < 7; offset++) {
      const date = wednesday.add({ days: offset });
      const weekStartsOn = (date.dayOfWeek === 7 ? 0 : date.dayOfWeek) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
      expect(startOfWeek(date, weekStartsOn).toString()).toBe(date.toString());
    }
  });
});
