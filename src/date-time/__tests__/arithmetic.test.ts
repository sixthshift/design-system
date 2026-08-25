/**
 * Tests for arithmetic.ts - Date/time arithmetic utilities
 */

import { describe, expect, test } from "vitest";
import {
  addDays,
  addMonths,
  addWeeks,
  differenceInMinutes,
  diffInDays,
  diffInMonths,
  eachDayOfInterval,
  parseDate,
  parseInstant,
  subtractDays,
  subtractMonths,
  subtractWeeks,
} from "../index";

// =============================================================================
// addDays
// =============================================================================

describe("addDays", () => {
  test("advances a mid-month date by the given number of days", () => {
    const date = parseDate("2026-01-15");
    const result = addDays(date, 5);
    expect(result.toString()).toBe("2026-01-20");
  });

  test("crosses a month boundary from January to February", () => {
    const date = parseDate("2026-01-30");
    const result = addDays(date, 3);
    expect(result.toString()).toBe("2026-02-02");
  });

  test("crosses a year boundary from December to January", () => {
    const date = parseDate("2025-12-30");
    const result = addDays(date, 5);
    expect(result.toString()).toBe("2026-01-04");
  });

  test("handles adding zero days by returning the same date", () => {
    const date = parseDate("2026-03-15");
    const result = addDays(date, 0);
    expect(result.toString()).toBe("2026-03-15");
  });

  test("crosses a leap year February 29 boundary", () => {
    const date = parseDate("2024-02-28");
    const result = addDays(date, 1);
    expect(result.toString()).toBe("2024-02-29");
  });

  test("crosses a non-leap year February 28 boundary", () => {
    const date = parseDate("2025-02-28");
    const result = addDays(date, 1);
    expect(result.toString()).toBe("2025-03-01");
  });

  test("handles adding a large number of days", () => {
    const date = parseDate("2026-01-01");
    const result = addDays(date, 365);
    expect(result.toString()).toBe("2027-01-01");
  });
});

// =============================================================================
// subtractDays
// =============================================================================

describe("subtractDays", () => {
  test("subtracts days within the same month", () => {
    const date = parseDate("2026-01-20");
    const result = subtractDays(date, 5);
    expect(result.toString()).toBe("2026-01-15");
  });

  test("crosses a month boundary backward from March to February", () => {
    const date = parseDate("2026-03-02");
    const result = subtractDays(date, 3);
    expect(result.toString()).toBe("2026-02-27");
  });

  test("crosses a year boundary backward from January to December", () => {
    const date = parseDate("2026-01-03");
    const result = subtractDays(date, 5);
    expect(result.toString()).toBe("2025-12-29");
  });

  test("handles subtracting zero days by returning the same date", () => {
    const date = parseDate("2026-06-15");
    const result = subtractDays(date, 0);
    expect(result.toString()).toBe("2026-06-15");
  });
});

// =============================================================================
// addMonths
// =============================================================================

describe("addMonths", () => {
  test("advances a date by one month within the same year", () => {
    const date = parseDate("2026-03-15");
    const result = addMonths(date, 1);
    expect(result.toString()).toBe("2026-04-15");
  });

  test("clamps day to end of month when target month is shorter (Jan 31 + 1 month)", () => {
    const date = parseDate("2026-01-31");
    const result = addMonths(date, 1);
    // February has 28 days in 2026, so it should clamp to Feb 28
    expect(result.toString()).toBe("2026-02-28");
  });

  test("handles Jan 31 + 1 month in a leap year", () => {
    const date = parseDate("2024-01-31");
    const result = addMonths(date, 1);
    expect(result.toString()).toBe("2024-02-29");
  });

  test("crosses a year boundary from November to January", () => {
    const date = parseDate("2025-11-15");
    const result = addMonths(date, 2);
    expect(result.toString()).toBe("2026-01-15");
  });

  test("handles adding zero months by returning the same date", () => {
    const date = parseDate("2026-05-15");
    const result = addMonths(date, 0);
    expect(result.toString()).toBe("2026-05-15");
  });

  test("adds multiple months across multiple years", () => {
    const date = parseDate("2026-01-15");
    const result = addMonths(date, 24);
    expect(result.toString()).toBe("2028-01-15");
  });
});

// =============================================================================
// subtractMonths
// =============================================================================

describe("subtractMonths", () => {
  test("subtracts months within the same year", () => {
    const date = parseDate("2026-06-15");
    const result = subtractMonths(date, 2);
    expect(result.toString()).toBe("2026-04-15");
  });

  test("crosses a year boundary backward from February to December", () => {
    const date = parseDate("2026-02-15");
    const result = subtractMonths(date, 3);
    expect(result.toString()).toBe("2025-11-15");
  });

  test("clamps day when target month is shorter (Mar 31 - 1 month)", () => {
    const date = parseDate("2026-03-31");
    const result = subtractMonths(date, 1);
    expect(result.toString()).toBe("2026-02-28");
  });
});

// =============================================================================
// addWeeks
// =============================================================================

describe("addWeeks", () => {
  test("adds one week to a date", () => {
    const date = parseDate("2026-01-15");
    const result = addWeeks(date, 1);
    expect(result.toString()).toBe("2026-01-22");
  });

  test("adds multiple weeks crossing a month boundary", () => {
    const date = parseDate("2026-01-20");
    const result = addWeeks(date, 2);
    expect(result.toString()).toBe("2026-02-03");
  });

  test("handles adding zero weeks by returning the same date", () => {
    const date = parseDate("2026-07-04");
    const result = addWeeks(date, 0);
    expect(result.toString()).toBe("2026-07-04");
  });
});

// =============================================================================
// subtractWeeks
// =============================================================================

describe("subtractWeeks", () => {
  test("subtracts one week from a date", () => {
    const date = parseDate("2026-01-22");
    const result = subtractWeeks(date, 1);
    expect(result.toString()).toBe("2026-01-15");
  });

  test("subtracts weeks crossing a month boundary backward", () => {
    const date = parseDate("2026-02-03");
    const result = subtractWeeks(date, 2);
    expect(result.toString()).toBe("2026-01-20");
  });

  test("subtracts weeks crossing a year boundary backward", () => {
    const date = parseDate("2026-01-05");
    const result = subtractWeeks(date, 2);
    expect(result.toString()).toBe("2025-12-22");
  });
});

// =============================================================================
// diffInDays
// =============================================================================

describe("diffInDays", () => {
  test("returns positive days when 'to' is after 'from'", () => {
    const from = parseDate("2026-01-10");
    const to = parseDate("2026-01-15");
    expect(diffInDays(from, to)).toBe(5);
  });

  test("returns negative when 'to' is before 'from'", () => {
    const from = parseDate("2026-01-15");
    const to = parseDate("2026-01-10");
    expect(diffInDays(from, to)).toBe(-5);
  });

  test("returns zero when both dates are the same", () => {
    const date = parseDate("2026-06-15");
    expect(diffInDays(date, date)).toBe(0);
  });

  test("counts days correctly across a month boundary", () => {
    const from = parseDate("2026-01-28");
    const to = parseDate("2026-02-04");
    expect(diffInDays(from, to)).toBe(7);
  });

  test("counts days across a year boundary", () => {
    const from = parseDate("2025-12-29");
    const to = parseDate("2026-01-03");
    expect(diffInDays(from, to)).toBe(5);
  });

  test("counts days across a leap year February", () => {
    const from = parseDate("2024-02-28");
    const to = parseDate("2024-03-01");
    expect(diffInDays(from, to)).toBe(2); // Feb 28 → Feb 29 → Mar 1
  });

  test("counts days across a non-leap year February", () => {
    const from = parseDate("2025-02-28");
    const to = parseDate("2025-03-01");
    expect(diffInDays(from, to)).toBe(1);
  });
});

// =============================================================================
// diffInMonths
// =============================================================================

describe("diffInMonths", () => {
  test("returns the number of full months between two dates", () => {
    const from = parseDate("2026-01-15");
    const to = parseDate("2026-04-15");
    expect(diffInMonths(from, to)).toBe(3);
  });

  test("returns negative months when 'to' is before 'from'", () => {
    const from = parseDate("2026-06-15");
    const to = parseDate("2026-01-15");
    expect(diffInMonths(from, to)).toBe(-5);
  });

  test("returns zero when dates are in the same month and year", () => {
    const from = parseDate("2026-03-01");
    const to = parseDate("2026-03-28");
    expect(diffInMonths(from, to)).toBe(0);
  });

  test("counts months correctly across year boundaries", () => {
    const from = parseDate("2025-10-15");
    const to = parseDate("2026-03-15");
    expect(diffInMonths(from, to)).toBe(5);
  });

  test("counts months across multiple years", () => {
    const from = parseDate("2024-01-01");
    const to = parseDate("2026-01-01");
    expect(diffInMonths(from, to)).toBe(24);
  });
});

// =============================================================================
// differenceInMinutes
// =============================================================================

describe("differenceInMinutes", () => {
  test("returns the number of minutes between two instants", () => {
    const from = parseInstant("2026-01-15T10:00:00Z");
    const to = parseInstant("2026-01-15T10:30:00Z");
    expect(differenceInMinutes(from, to)).toBe(30);
  });

  test("returns negative minutes when 'to' is before 'from'", () => {
    const from = parseInstant("2026-01-15T10:30:00Z");
    const to = parseInstant("2026-01-15T10:00:00Z");
    expect(differenceInMinutes(from, to)).toBe(-30);
  });

  test("returns zero when both instants are the same", () => {
    const instant = parseInstant("2026-01-15T12:00:00Z");
    expect(differenceInMinutes(instant, instant)).toBe(0);
  });

  test("floors fractional minutes when seconds are involved", () => {
    const from = parseInstant("2026-01-15T10:00:00Z");
    const to = parseInstant("2026-01-15T10:05:45Z");
    expect(differenceInMinutes(from, to)).toBe(5);
  });

  test("handles large differences across days", () => {
    const from = parseInstant("2026-01-15T00:00:00Z");
    const to = parseInstant("2026-01-16T00:00:00Z");
    expect(differenceInMinutes(from, to)).toBe(1440); // 24 * 60
  });
});

// =============================================================================
// eachDayOfInterval
// =============================================================================

describe("eachDayOfInterval", () => {
  test("generates all dates in an inclusive forward interval", () => {
    const start = parseDate("2026-01-15");
    const end = parseDate("2026-01-18");
    const result = eachDayOfInterval(start, end);
    expect(result.map((d) => d.toString())).toEqual(["2026-01-15", "2026-01-16", "2026-01-17", "2026-01-18"]);
  });

  test("returns a single-element array when start equals end", () => {
    const date = parseDate("2026-03-10");
    const result = eachDayOfInterval(date, date);
    expect(result.length).toBe(1);
    expect(result[0].toString()).toBe("2026-03-10");
  });

  test("generates dates in reverse order when start is after end", () => {
    const start = parseDate("2026-01-18");
    const end = parseDate("2026-01-15");
    const result = eachDayOfInterval(start, end);
    expect(result.map((d) => d.toString())).toEqual(["2026-01-18", "2026-01-17", "2026-01-16", "2026-01-15"]);
  });

  test("crosses a month boundary in the interval", () => {
    const start = parseDate("2026-01-30");
    const end = parseDate("2026-02-02");
    const result = eachDayOfInterval(start, end);
    expect(result.map((d) => d.toString())).toEqual(["2026-01-30", "2026-01-31", "2026-02-01", "2026-02-02"]);
  });

  test("includes leap day when interval spans February 28-29 in a leap year", () => {
    const start = parseDate("2024-02-28");
    const end = parseDate("2024-03-01");
    const result = eachDayOfInterval(start, end);
    expect(result.map((d) => d.toString())).toEqual(["2024-02-28", "2024-02-29", "2024-03-01"]);
  });

  test("generates correct count for a full week", () => {
    const start = parseDate("2026-03-02"); // Monday
    const end = parseDate("2026-03-08"); // Sunday
    const result = eachDayOfInterval(start, end);
    expect(result.length).toBe(7);
  });
});
