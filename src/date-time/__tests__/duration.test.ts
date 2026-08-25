/**
 * Tests for duration.ts - Duration creation and conversion utilities
 */

import { describe, expect, test } from "vitest";
import { days, hours, minutes, Temporal, toHours, toMilliseconds, toMinutes, toSeconds, weeks } from "../index";

// =============================================================================
// hours
// =============================================================================

describe("hours", () => {
  test("creates a duration of 1 hour", () => {
    const result = hours(1);
    expect(result.hours).toBe(1);
    expect(result.toString()).toBe("PT1H");
  });

  test("creates a duration of multiple hours", () => {
    const result = hours(8);
    expect(result.hours).toBe(8);
    expect(result.toString()).toBe("PT8H");
  });

  test("creates a zero-hour duration", () => {
    const result = hours(0);
    expect(result.hours).toBe(0);
    expect(result.toString()).toBe("PT0S");
  });
});

// =============================================================================
// minutes
// =============================================================================

describe("minutes", () => {
  test("creates a duration of 1 minute", () => {
    const result = minutes(1);
    expect(result.minutes).toBe(1);
    expect(result.toString()).toBe("PT1M");
  });

  test("creates a duration of 30 minutes", () => {
    const result = minutes(30);
    expect(result.minutes).toBe(30);
    expect(result.toString()).toBe("PT30M");
  });

  test("creates a duration of 90 minutes without auto-balancing", () => {
    const result = minutes(90);
    expect(result.minutes).toBe(90);
    expect(result.toString()).toBe("PT90M");
  });
});

// =============================================================================
// days
// =============================================================================

describe("days", () => {
  test("creates a duration of 1 day", () => {
    const result = days(1);
    expect(result.days).toBe(1);
    expect(result.toString()).toBe("P1D");
  });

  test("creates a duration of 7 days", () => {
    const result = days(7);
    expect(result.days).toBe(7);
    expect(result.toString()).toBe("P7D");
  });

  test("creates a zero-day duration", () => {
    const result = days(0);
    expect(result.days).toBe(0);
    expect(result.toString()).toBe("PT0S");
  });
});

// =============================================================================
// weeks
// =============================================================================

describe("weeks", () => {
  test("creates a duration of 1 week", () => {
    const result = weeks(1);
    expect(result.weeks).toBe(1);
    expect(result.toString()).toBe("P1W");
  });

  test("creates a duration of 4 weeks", () => {
    const result = weeks(4);
    expect(result.weeks).toBe(4);
    expect(result.toString()).toBe("P4W");
  });
});

// =============================================================================
// toMilliseconds
// =============================================================================

describe("toMilliseconds", () => {
  test("converts 1 hour to 3600000 milliseconds", () => {
    expect(toMilliseconds(hours(1))).toBe(3_600_000);
  });

  test("converts 1 minute to 60000 milliseconds", () => {
    expect(toMilliseconds(minutes(1))).toBe(60_000);
  });

  test("converts a complex duration to milliseconds", () => {
    const duration = Temporal.Duration.from({ hours: 1, minutes: 30 });
    expect(toMilliseconds(duration)).toBe(5_400_000); // 90 minutes
  });

  test("converts 0 duration to 0 milliseconds", () => {
    expect(toMilliseconds(hours(0))).toBe(0);
  });
});

// =============================================================================
// toSeconds
// =============================================================================

describe("toSeconds", () => {
  test("converts 1 hour to 3600 seconds", () => {
    expect(toSeconds(hours(1))).toBe(3600);
  });

  test("converts 1 minute to 60 seconds", () => {
    expect(toSeconds(minutes(1))).toBe(60);
  });

  test("converts a 30-minute duration to 1800 seconds", () => {
    expect(toSeconds(minutes(30))).toBe(1800);
  });
});

// =============================================================================
// toMinutes
// =============================================================================

describe("toMinutes", () => {
  test("converts 1 hour to 60 minutes", () => {
    expect(toMinutes(hours(1))).toBe(60);
  });

  test("converts 30 minutes to 30", () => {
    expect(toMinutes(minutes(30))).toBe(30);
  });

  test("converts 2 hours and 15 minutes to 135 minutes", () => {
    const duration = Temporal.Duration.from({ hours: 2, minutes: 15 });
    expect(toMinutes(duration)).toBe(135);
  });
});

// =============================================================================
// toHours
// =============================================================================

describe("toHours", () => {
  test("converts 60 minutes to 1 hour", () => {
    expect(toHours(minutes(60))).toBe(1);
  });

  test("converts 90 minutes to 1.5 hours", () => {
    expect(toHours(minutes(90))).toBe(1.5);
  });

  test("converts 8 hours back to 8 (roundtrip)", () => {
    expect(toHours(hours(8))).toBe(8);
  });

  test("converts 0 duration to 0 hours", () => {
    expect(toHours(hours(0))).toBe(0);
  });
});

// =============================================================================
// Roundtrip tests
// =============================================================================

describe("roundtrip conversions", () => {
  test("toHours(hours(n)) returns n for any positive integer", () => {
    expect(toHours(hours(1))).toBe(1);
    expect(toHours(hours(5))).toBe(5);
    expect(toHours(hours(24))).toBe(24);
  });

  test("toMinutes(minutes(n)) returns n for any positive integer", () => {
    expect(toMinutes(minutes(1))).toBe(1);
    expect(toMinutes(minutes(45))).toBe(45);
    expect(toMinutes(minutes(120))).toBe(120);
  });

  test("toSeconds(minutes(1)) equals 60", () => {
    expect(toSeconds(minutes(1))).toBe(60);
  });

  test("toMilliseconds(minutes(1)) equals 60000", () => {
    expect(toMilliseconds(minutes(1))).toBe(60_000);
  });

  test("toHours(minutes(30)) returns 0.5", () => {
    expect(toHours(minutes(30))).toBe(0.5);
  });
});
