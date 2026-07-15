/**
 * Tests for compare.ts - Boolean comparison operations for dates and instants
 */

import { describe, expect, test } from "vitest";
import {
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
  parseDate,
  parseInstant,
  Temporal,
} from "../index";

// =============================================================================
// isBefore
// =============================================================================

describe("isBefore", () => {
  test("returns true when the first date is earlier than the second", () => {
    const a = parseDate("2026-01-10");
    const b = parseDate("2026-01-15");
    expect(isBefore(a, b)).toBe(true);
  });

  test("returns false when the first date is later than the second", () => {
    const a = parseDate("2026-01-20");
    const b = parseDate("2026-01-15");
    expect(isBefore(a, b)).toBe(false);
  });

  test("returns false when both dates are the same", () => {
    const date = parseDate("2026-06-15");
    expect(isBefore(date, date)).toBe(false);
  });

  test("compares correctly across year boundaries", () => {
    const a = parseDate("2025-12-31");
    const b = parseDate("2026-01-01");
    expect(isBefore(a, b)).toBe(true);
  });
});

// =============================================================================
// isAfter
// =============================================================================

describe("isAfter", () => {
  test("returns true when the first date is later than the second", () => {
    const a = parseDate("2026-03-20");
    const b = parseDate("2026-03-10");
    expect(isAfter(a, b)).toBe(true);
  });

  test("returns false when the first date is earlier than the second", () => {
    const a = parseDate("2026-03-05");
    const b = parseDate("2026-03-10");
    expect(isAfter(a, b)).toBe(false);
  });

  test("returns false when both dates are the same", () => {
    const date = parseDate("2026-09-01");
    expect(isAfter(date, date)).toBe(false);
  });
});

// =============================================================================
// isSameDay
// =============================================================================

describe("isSameDay", () => {
  test("returns true when both dates represent the same day", () => {
    const a = parseDate("2026-05-20");
    const b = parseDate("2026-05-20");
    expect(isSameDay(a, b)).toBe(true);
  });

  test("returns false when dates differ by one day", () => {
    const a = parseDate("2026-05-20");
    const b = parseDate("2026-05-21");
    expect(isSameDay(a, b)).toBe(false);
  });

  test("returns false when same day and month but different year", () => {
    const a = parseDate("2025-05-20");
    const b = parseDate("2026-05-20");
    expect(isSameDay(a, b)).toBe(false);
  });
});

// =============================================================================
// isSameMonth
// =============================================================================

describe("isSameMonth", () => {
  test("returns true when both dates are in the same month and year", () => {
    const a = parseDate("2026-03-01");
    const b = parseDate("2026-03-28");
    expect(isSameMonth(a, b)).toBe(true);
  });

  test("returns false when dates are in the same month but different year", () => {
    const a = parseDate("2025-03-15");
    const b = parseDate("2026-03-15");
    expect(isSameMonth(a, b)).toBe(false);
  });

  test("returns false when dates are in different months of the same year", () => {
    const a = parseDate("2026-03-15");
    const b = parseDate("2026-04-15");
    expect(isSameMonth(a, b)).toBe(false);
  });

  test("returns true for the first and last day of the same month", () => {
    const a = parseDate("2026-07-01");
    const b = parseDate("2026-07-31");
    expect(isSameMonth(a, b)).toBe(true);
  });
});

// =============================================================================
// isInstantBefore
// =============================================================================

describe("isInstantBefore", () => {
  test("returns true when the first instant is earlier", () => {
    const a = parseInstant("2026-01-15T10:00:00Z");
    const b = parseInstant("2026-01-15T10:30:00Z");
    expect(isInstantBefore(a, b)).toBe(true);
  });

  test("returns false when the first instant is later", () => {
    const a = parseInstant("2026-01-15T11:00:00Z");
    const b = parseInstant("2026-01-15T10:30:00Z");
    expect(isInstantBefore(a, b)).toBe(false);
  });

  test("returns false when both instants are equal", () => {
    const instant = parseInstant("2026-01-15T10:00:00Z");
    expect(isInstantBefore(instant, instant)).toBe(false);
  });
});

// =============================================================================
// isInstantAfter
// =============================================================================

describe("isInstantAfter", () => {
  test("returns true when the first instant is later", () => {
    const a = parseInstant("2026-01-15T12:00:00Z");
    const b = parseInstant("2026-01-15T10:00:00Z");
    expect(isInstantAfter(a, b)).toBe(true);
  });

  test("returns false when the first instant is earlier", () => {
    const a = parseInstant("2026-01-15T08:00:00Z");
    const b = parseInstant("2026-01-15T10:00:00Z");
    expect(isInstantAfter(a, b)).toBe(false);
  });

  test("returns false when both instants are equal", () => {
    const instant = parseInstant("2026-01-15T10:00:00Z");
    expect(isInstantAfter(instant, instant)).toBe(false);
  });
});

// =============================================================================
// isToday
// =============================================================================

describe("isToday", () => {
  test("returns true for the current date", () => {
    const todayDate = Temporal.Now.plainDateISO();
    expect(isToday(todayDate)).toBe(true);
  });

  test("returns false for a date clearly in the past", () => {
    const pastDate = parseDate("2020-01-01");
    expect(isToday(pastDate)).toBe(false);
  });

  test("returns false for a date clearly in the future", () => {
    const futureDate = parseDate("2099-12-31");
    expect(isToday(futureDate)).toBe(false);
  });
});

// =============================================================================
// isPast
// =============================================================================

describe("isPast", () => {
  test("returns true for a date clearly in the past", () => {
    const pastDate = parseDate("2020-01-01");
    expect(isPast(pastDate)).toBe(true);
  });

  test("returns false for a date clearly in the future", () => {
    const futureDate = parseDate("2099-12-31");
    expect(isPast(futureDate)).toBe(false);
  });

  test("returns false for today's date because it is not strictly before today", () => {
    const todayDate = Temporal.Now.plainDateISO();
    expect(isPast(todayDate)).toBe(false);
  });
});

// =============================================================================
// isFuture
// =============================================================================

describe("isFuture", () => {
  test("returns true for a date clearly in the future", () => {
    const futureDate = parseDate("2099-12-31");
    expect(isFuture(futureDate)).toBe(true);
  });

  test("returns false for a date clearly in the past", () => {
    const pastDate = parseDate("2020-01-01");
    expect(isFuture(pastDate)).toBe(false);
  });

  test("returns false for today's date because it is not strictly after today", () => {
    const todayDate = Temporal.Now.plainDateISO();
    expect(isFuture(todayDate)).toBe(false);
  });
});

// =============================================================================
// isInstantPast
// =============================================================================

describe("isInstantPast", () => {
  test("returns true for an instant clearly in the past", () => {
    const pastInstant = parseInstant("2020-01-01T00:00:00Z");
    expect(isInstantPast(pastInstant)).toBe(true);
  });

  test("returns false for an instant clearly in the future", () => {
    const futureInstant = parseInstant("2099-12-31T23:59:59Z");
    expect(isInstantPast(futureInstant)).toBe(false);
  });
});

// =============================================================================
// isInstantFuture
// =============================================================================

describe("isInstantFuture", () => {
  test("returns true for an instant clearly in the future", () => {
    const futureInstant = parseInstant("2099-12-31T23:59:59Z");
    expect(isInstantFuture(futureInstant)).toBe(true);
  });

  test("returns false for an instant clearly in the past", () => {
    const pastInstant = parseInstant("2020-01-01T00:00:00Z");
    expect(isInstantFuture(pastInstant)).toBe(false);
  });
});
