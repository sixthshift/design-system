/**
 * Tests for serialize.ts - Temporal to ISO 8601 string serialization
 */

import { describe, expect, test } from "vitest";
import {
  parseDate,
  parseDateTime,
  parseDuration,
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
  Temporal,
} from "../index";

// =============================================================================
// serialize (polymorphic)
// =============================================================================

describe("serialize", () => {
  test("serializes an Instant to a UTC ISO 8601 string", () => {
    const instant = parseInstant("2026-01-15T14:30:00Z");
    expect(serialize(instant)).toBe("2026-01-15T14:30:00Z");
  });

  test("serializes a PlainDate to an ISO 8601 date string", () => {
    const date = parseDate("2026-01-15");
    expect(serialize(date)).toBe("2026-01-15");
  });

  test("serializes a PlainDateTime to an ISO 8601 datetime string", () => {
    const dt = parseDateTime("2026-01-15T14:30:00");
    expect(serialize(dt)).toBe("2026-01-15T14:30:00");
  });

  test("serializes a PlainTime to an ISO 8601 time string", () => {
    const time = parseTime("14:30:00");
    expect(serialize(time)).toBe("14:30:00");
  });

  test("serializes a ZonedDateTime to a string with timezone annotation", () => {
    const zoned = parseZoned("2026-01-15T14:30:00-05:00[America/New_York]");
    const result = serialize(zoned);
    expect(result).toContain("2026-01-15T14:30:00");
    expect(result).toContain("[America/New_York]");
  });

  test("serializes a Duration to an ISO 8601 duration string", () => {
    const duration = parseDuration("PT2H30M");
    expect(serialize(duration)).toBe("PT2H30M");
  });

  test("serializes an Instant with fractional seconds", () => {
    const instant = parseInstant("2026-01-15T14:30:00.456Z");
    expect(serialize(instant)).toBe("2026-01-15T14:30:00.456Z");
  });

  test("serializes midnight PlainTime correctly", () => {
    const time = parseTime("00:00:00");
    expect(serialize(time)).toBe("00:00:00");
  });

  test("serializes a complex Duration with years, months, days, and time", () => {
    const duration = parseDuration("P1Y2M3DT4H5M6S");
    expect(serialize(duration)).toBe("P1Y2M3DT4H5M6S");
  });
});

// =============================================================================
// serializeOptional
// =============================================================================

describe("serializeOptional", () => {
  test("serializes a valid Temporal type to its ISO string", () => {
    const date = parseDate("2026-05-20");
    expect(serializeOptional(date)).toBe("2026-05-20");
  });

  test("returns undefined for null input", () => {
    expect(serializeOptional(null)).toBeUndefined();
  });

  test("returns undefined for undefined input", () => {
    expect(serializeOptional(undefined)).toBeUndefined();
  });

  test("serializes an Instant when provided", () => {
    const instant = parseInstant("2026-01-15T10:00:00Z");
    expect(serializeOptional(instant)).toBe("2026-01-15T10:00:00Z");
  });

  test("serializes a Duration when provided", () => {
    const duration = parseDuration("PT1H");
    expect(serializeOptional(duration)).toBe("PT1H");
  });
});

// =============================================================================
// serializeInstant
// =============================================================================

describe("serializeInstant", () => {
  test("serializes an Instant to a UTC ISO string", () => {
    const instant = parseInstant("2026-01-15T14:30:00Z");
    expect(serializeInstant(instant)).toBe("2026-01-15T14:30:00Z");
  });

  test("normalizes a non-UTC offset to UTC", () => {
    const instant = parseInstant("2026-01-15T14:30:00+05:30");
    expect(serializeInstant(instant)).toBe("2026-01-15T09:00:00Z");
  });

  test("preserves fractional seconds", () => {
    const instant = parseInstant("2026-01-15T14:30:00.123456789Z");
    expect(serializeInstant(instant)).toBe("2026-01-15T14:30:00.123456789Z");
  });
});

// =============================================================================
// serializeDate
// =============================================================================

describe("serializeDate", () => {
  test("serializes a PlainDate to YYYY-MM-DD format", () => {
    const date = parseDate("2026-01-15");
    expect(serializeDate(date)).toBe("2026-01-15");
  });

  test("serializes a leap year date correctly", () => {
    const date = parseDate("2024-02-29");
    expect(serializeDate(date)).toBe("2024-02-29");
  });

  test("serializes year boundary dates", () => {
    expect(serializeDate(parseDate("2026-01-01"))).toBe("2026-01-01");
    expect(serializeDate(parseDate("2026-12-31"))).toBe("2026-12-31");
  });
});

// =============================================================================
// serializeDateTime
// =============================================================================

describe("serializeDateTime", () => {
  test("serializes a PlainDateTime to ISO format", () => {
    const dt = parseDateTime("2026-01-15T14:30:00");
    expect(serializeDateTime(dt)).toBe("2026-01-15T14:30:00");
  });

  test("preserves fractional seconds in the output", () => {
    const dt = parseDateTime("2026-01-15T14:30:45.123");
    expect(serializeDateTime(dt)).toBe("2026-01-15T14:30:45.123");
  });

  test("serializes midnight datetime correctly", () => {
    const dt = parseDateTime("2026-01-15T00:00:00");
    expect(serializeDateTime(dt)).toBe("2026-01-15T00:00:00");
  });
});

// =============================================================================
// serializeTime
// =============================================================================

describe("serializeTime", () => {
  test("serializes a PlainTime to HH:MM:SS format", () => {
    const time = parseTime("14:30:00");
    expect(serializeTime(time)).toBe("14:30:00");
  });

  test("serializes midnight correctly", () => {
    const time = parseTime("00:00:00");
    expect(serializeTime(time)).toBe("00:00:00");
  });

  test("serializes time with fractional seconds", () => {
    const time = parseTime("14:30:45.123");
    expect(serializeTime(time)).toBe("14:30:45.123");
  });

  test("serializes end-of-day time correctly", () => {
    const time = parseTime("23:59:59");
    expect(serializeTime(time)).toBe("23:59:59");
  });
});

// =============================================================================
// serializeZonedDateTime
// =============================================================================

describe("serializeZonedDateTime", () => {
  test("serializes a ZonedDateTime with timezone annotation", () => {
    const zoned = parseZoned("2026-01-15T14:30:00-05:00[America/New_York]");
    expect(serializeZonedDateTime(zoned)).toBe("2026-01-15T14:30:00-05:00[America/New_York]");
  });

  test("serializes a UTC ZonedDateTime correctly", () => {
    const zoned = parseZoned("2026-01-15T14:30:00+00:00[UTC]");
    const result = serializeZonedDateTime(zoned);
    expect(result).toContain("[UTC]");
    expect(result).toContain("14:30:00");
  });

  test("serializes a ZonedDateTime in Asia/Tokyo timezone", () => {
    const zoned = parseZoned("2026-01-15T23:30:00+09:00[Asia/Tokyo]");
    const result = serializeZonedDateTime(zoned);
    expect(result).toContain("[Asia/Tokyo]");
    expect(result).toContain("23:30:00");
  });
});

// =============================================================================
// serializeDuration
// =============================================================================

describe("serializeDuration", () => {
  test("serializes an hours-and-minutes duration", () => {
    const duration = parseDuration("PT1H30M");
    expect(serializeDuration(duration)).toBe("PT1H30M");
  });

  test("serializes a days-only duration", () => {
    const duration = parseDuration("P7D");
    expect(serializeDuration(duration)).toBe("P7D");
  });

  test("serializes a seconds-only duration", () => {
    const duration = parseDuration("PT45S");
    expect(serializeDuration(duration)).toBe("PT45S");
  });

  test("serializes a complex duration with all components", () => {
    const duration = parseDuration("P1Y2M3DT4H5M6S");
    expect(serializeDuration(duration)).toBe("P1Y2M3DT4H5M6S");
  });
});
