/**
 * Tests for timezone.ts - Timezone conversion utilities
 */

import { describe, expect, test } from "vitest";
import {
  changeTimezone,
  parseDate,
  parseDateTime,
  parseInstant,
  parseZoned,
  plainDateTimeToZonedDateTime,
  plainDateToZonedDateTime,
  Temporal,
  toTimezone,
} from "../index";

// =============================================================================
// toTimezone
// =============================================================================

describe("toTimezone", () => {
  test("converts a UTC instant to America/New_York timezone", () => {
    const instant = parseInstant("2026-01-15T18:00:00Z");
    const result = toTimezone(instant, "America/New_York");
    expect(result.timeZoneId).toBe("America/New_York");
    // January is EST (UTC-5)
    expect(result.hour).toBe(13);
    expect(result.day).toBe(15);
  });

  test("converts a UTC instant to Asia/Tokyo timezone", () => {
    const instant = parseInstant("2026-01-15T10:00:00Z");
    const result = toTimezone(instant, "Asia/Tokyo");
    expect(result.timeZoneId).toBe("Asia/Tokyo");
    // JST is UTC+9
    expect(result.hour).toBe(19);
    expect(result.day).toBe(15);
  });

  test("converts a UTC instant to Europe/London timezone in winter (no DST)", () => {
    const instant = parseInstant("2026-01-15T12:00:00Z");
    const result = toTimezone(instant, "Europe/London");
    expect(result.timeZoneId).toBe("Europe/London");
    // GMT in January, so same hour
    expect(result.hour).toBe(12);
  });

  test("converts a UTC instant to Europe/London timezone in summer (BST)", () => {
    const instant = parseInstant("2026-07-15T12:00:00Z");
    const result = toTimezone(instant, "Europe/London");
    expect(result.timeZoneId).toBe("Europe/London");
    // BST is UTC+1 in summer
    expect(result.hour).toBe(13);
  });

  test("handles date boundary crossing when converting timezone", () => {
    // Late night UTC pushes into the next day in Tokyo
    const instant = parseInstant("2026-01-15T20:00:00Z");
    const result = toTimezone(instant, "Asia/Tokyo");
    // 20:00 UTC + 9 = 05:00 next day
    expect(result.day).toBe(16);
    expect(result.hour).toBe(5);
  });

  test("preserves the exact point in time when converting timezone", () => {
    const instant = parseInstant("2026-06-15T15:30:00Z");
    const ny = toTimezone(instant, "America/New_York");
    const tokyo = toTimezone(instant, "Asia/Tokyo");
    // Both should represent the same instant
    expect(ny.toInstant().toString()).toBe(tokyo.toInstant().toString());
  });
});

// =============================================================================
// changeTimezone
// =============================================================================

describe("changeTimezone", () => {
  test("converts a ZonedDateTime from New York to Los Angeles", () => {
    const zoned = parseZoned("2026-01-15T12:00:00-05:00[America/New_York]");
    const result = changeTimezone(zoned, "America/Los_Angeles");
    expect(result.timeZoneId).toBe("America/Los_Angeles");
    // PST is UTC-8, EST is UTC-5, so 3 hours behind
    expect(result.hour).toBe(9);
    expect(result.day).toBe(15);
  });

  test("converts a ZonedDateTime from Tokyo to UTC", () => {
    const zoned = parseZoned("2026-01-15T21:00:00+09:00[Asia/Tokyo]");
    const result = changeTimezone(zoned, "UTC");
    expect(result.timeZoneId).toBe("UTC");
    // 21:00 JST - 9 = 12:00 UTC
    expect(result.hour).toBe(12);
  });

  test("preserves the exact point in time when changing timezone", () => {
    const zoned = parseZoned("2026-01-15T12:00:00-05:00[America/New_York]");
    const changed = changeTimezone(zoned, "Asia/Tokyo");
    expect(zoned.toInstant().toString()).toBe(changed.toInstant().toString());
  });

  test("correctly changes timezone when crossing a date boundary", () => {
    const zoned = parseZoned("2026-01-15T22:00:00-05:00[America/New_York]");
    const result = changeTimezone(zoned, "Asia/Tokyo");
    // 22:00 EST (UTC-5) = 03:00 UTC (Jan 16) + 9 = 12:00 JST (Jan 16)
    expect(result.day).toBe(16);
    expect(result.hour).toBe(12);
  });
});

// =============================================================================
// plainDateTimeToZonedDateTime
// =============================================================================

describe("plainDateTimeToZonedDateTime", () => {
  test("interprets a PlainDateTime in a specified timezone", () => {
    const dt = parseDateTime("2026-01-15T15:30:00");
    const result = plainDateTimeToZonedDateTime(dt, "America/Los_Angeles");
    expect(result.timeZoneId).toBe("America/Los_Angeles");
    expect(result.hour).toBe(15);
    expect(result.minute).toBe(30);
    expect(result.day).toBe(15);
  });

  test("interprets a PlainDateTime in UTC", () => {
    const dt = parseDateTime("2026-06-20T08:00:00");
    const result = plainDateTimeToZonedDateTime(dt, "UTC");
    expect(result.timeZoneId).toBe("UTC");
    expect(result.hour).toBe(8);
    expect(result.toInstant().toString()).toBe("2026-06-20T08:00:00Z");
  });

  test("uses the system timezone when no timezone is specified", () => {
    const dt = parseDateTime("2026-01-15T10:00:00");
    const result = plainDateTimeToZonedDateTime(dt);
    // Should use the system timezone
    expect(result.timeZoneId).toBe(Temporal.Now.timeZoneId());
    expect(result.hour).toBe(10);
  });

  test("produces a ZonedDateTime whose local time matches the input PlainDateTime", () => {
    const dt = parseDateTime("2026-07-04T14:30:00");
    const result = plainDateTimeToZonedDateTime(dt, "America/New_York");
    expect(result.year).toBe(2026);
    expect(result.month).toBe(7);
    expect(result.day).toBe(4);
    expect(result.hour).toBe(14);
    expect(result.minute).toBe(30);
  });
});

// =============================================================================
// plainDateToZonedDateTime
// =============================================================================

describe("plainDateToZonedDateTime", () => {
  test("interprets a PlainDate as midnight in the specified timezone", () => {
    const date = parseDate("2026-01-15");
    const result = plainDateToZonedDateTime(date, "America/New_York");
    expect(result.timeZoneId).toBe("America/New_York");
    expect(result.hour).toBe(0);
    expect(result.minute).toBe(0);
    expect(result.second).toBe(0);
    expect(result.day).toBe(15);
  });

  test("interprets a PlainDate as midnight in Asia/Tokyo", () => {
    const date = parseDate("2026-03-20");
    const result = plainDateToZonedDateTime(date, "Asia/Tokyo");
    expect(result.timeZoneId).toBe("Asia/Tokyo");
    expect(result.hour).toBe(0);
    expect(result.day).toBe(20);
    // Midnight in Tokyo should be 15:00 UTC the previous day
    expect(result.toInstant().toString()).toBe("2026-03-19T15:00:00Z");
  });

  test("uses the system timezone when no timezone is specified", () => {
    const date = parseDate("2026-01-15");
    const result = plainDateToZonedDateTime(date);
    expect(result.timeZoneId).toBe(Temporal.Now.timeZoneId());
    expect(result.hour).toBe(0);
    expect(result.minute).toBe(0);
  });

  test("produces midnight regardless of which date is provided", () => {
    const date = parseDate("2026-12-31");
    const result = plainDateToZonedDateTime(date, "UTC");
    expect(result.hour).toBe(0);
    expect(result.minute).toBe(0);
    expect(result.second).toBe(0);
    expect(result.toInstant().toString()).toBe("2026-12-31T00:00:00Z");
  });
});
