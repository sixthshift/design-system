/**
 * Tests for parse.ts - External data to Temporal parsing functions
 */

import { describe, expect, test } from "vitest";
import {
  fromDate,
  isDuration,
  isInstant,
  isISODate,
  isPlainDate,
  isPlainDateTime,
  isPlainTime,
  isZonedDateTime,
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
} from "../index";

// =============================================================================
// fromDate - Date object conversion
// =============================================================================

describe("fromDate", () => {
  test("converts Date to Temporal.Instant", () => {
    const date = new Date("2025-01-15T14:30:00.000Z");
    const result = fromDate(date);
    expect(isInstant(result)).toBe(true);
    expect(result.toString()).toBe("2025-01-15T14:30:00Z");
  });

  test("preserves millisecond precision", () => {
    const date = new Date("2025-01-15T14:30:00.123Z");
    const result = fromDate(date);
    expect(result.epochMilliseconds).toBe(date.getTime());
  });

  test("handles epoch time", () => {
    const date = new Date(0);
    const result = fromDate(date);
    expect(result.toString()).toBe("1970-01-01T00:00:00Z");
  });

  test("handles far past dates", () => {
    const date = new Date("1900-01-01T00:00:00.000Z");
    const result = fromDate(date);
    expect(result.toString()).toBe("1900-01-01T00:00:00Z");
  });

  test("handles far future dates", () => {
    const date = new Date("2100-12-31T23:59:59.999Z");
    const result = fromDate(date);
    expect(result.epochMilliseconds).toBe(date.getTime());
  });

  test("converts fs.Stats-like mtime Date object", () => {
    // Simulate fs.Stats mtime which is a Date
    const mtime = new Date("2025-01-20T10:15:30.456Z");
    const instant = fromDate(mtime);
    expect(isInstant(instant)).toBe(true);
    expect(instant.epochMilliseconds).toBe(mtime.getTime());
  });
});

// =============================================================================
// parseInstant - ISO string parsing
// =============================================================================

describe("parseInstant", () => {
  test("parses UTC instant with Z suffix", () => {
    const result = parseInstant("2025-01-15T14:30:00.000Z");
    expect(isInstant(result)).toBe(true);
    expect(result.toString()).toBe("2025-01-15T14:30:00Z");
  });

  test("parses instant with positive offset", () => {
    const result = parseInstant("2025-01-15T14:30:00+05:30");
    expect(isInstant(result)).toBe(true);
  });

  test("parses instant with negative offset", () => {
    const result = parseInstant("2025-01-15T14:30:00-08:00");
    expect(isInstant(result)).toBe(true);
  });

  test("parses instant with fractional seconds", () => {
    const result = parseInstant("2025-01-15T14:30:00.123456789Z");
    expect(isInstant(result)).toBe(true);
  });

  test("throws on invalid instant string", () => {
    expect(() => parseInstant("not-an-instant")).toThrow();
  });

  test("throws on empty string", () => {
    expect(() => parseInstant("")).toThrow();
  });

  test("throws on date-only string (no timezone)", () => {
    expect(() => parseInstant("2025-01-15")).toThrow();
  });

  test("throws on datetime without timezone", () => {
    expect(() => parseInstant("2025-01-15T14:30:00")).toThrow();
  });
});

describe("parseInstantOrUndefined", () => {
  test("parses valid instant", () => {
    const result = parseInstantOrUndefined("2025-01-15T14:30:00Z");
    expect(isInstant(result)).toBe(true);
  });

  test("returns undefined for null", () => {
    expect(parseInstantOrUndefined(null)).toBeUndefined();
  });

  test("returns undefined for undefined", () => {
    expect(parseInstantOrUndefined(undefined)).toBeUndefined();
  });

  test("returns undefined for empty string", () => {
    expect(parseInstantOrUndefined("")).toBeUndefined();
  });

  test("throws on invalid non-empty string", () => {
    expect(() => parseInstantOrUndefined("invalid")).toThrow();
  });
});

// =============================================================================
// parseDate
// =============================================================================

describe("parseDate", () => {
  test("parses standard ISO date", () => {
    const result = parseDate("2025-01-15");
    expect(isPlainDate(result)).toBe(true);
    expect(result.toString()).toBe("2025-01-15");
  });

  test("parses leap year date", () => {
    const result = parseDate("2024-02-29");
    expect(isPlainDate(result)).toBe(true);
    expect(result.day).toBe(29);
    expect(result.month).toBe(2);
    expect(result.year).toBe(2024);
  });

  test("parses end of month dates", () => {
    expect(parseDate("2025-01-31").day).toBe(31);
    expect(parseDate("2025-04-30").day).toBe(30);
    expect(parseDate("2025-02-28").day).toBe(28);
  });

  test("parses year boundaries", () => {
    expect(parseDate("2025-01-01").toString()).toBe("2025-01-01");
    expect(parseDate("2025-12-31").toString()).toBe("2025-12-31");
  });

  test("throws on invalid date", () => {
    expect(() => parseDate("2025-02-30")).toThrow(); // Feb 30 doesn't exist
  });

  test("throws on invalid month", () => {
    expect(() => parseDate("2025-13-01")).toThrow();
  });

  test("throws on invalid format", () => {
    expect(() => parseDate("01-15-2025")).toThrow(); // Wrong format
  });

  test("throws on empty string", () => {
    expect(() => parseDate("")).toThrow();
  });

  test("throws on non-leap year Feb 29", () => {
    expect(() => parseDate("2025-02-29")).toThrow(); // 2025 is not a leap year
  });
});

describe("parseDateOrUndefined", () => {
  test("parses valid date", () => {
    const result = parseDateOrUndefined("2025-01-15");
    expect(isPlainDate(result)).toBe(true);
  });

  test("returns undefined for null", () => {
    expect(parseDateOrUndefined(null)).toBeUndefined();
  });

  test("returns undefined for undefined", () => {
    expect(parseDateOrUndefined(undefined)).toBeUndefined();
  });

  test("returns undefined for empty string", () => {
    expect(parseDateOrUndefined("")).toBeUndefined();
  });
});

// =============================================================================
// parseTime
// =============================================================================

describe("parseTime", () => {
  test("parses time with seconds", () => {
    const result = parseTime("14:30:00");
    expect(isPlainTime(result)).toBe(true);
    expect(result.hour).toBe(14);
    expect(result.minute).toBe(30);
    expect(result.second).toBe(0);
  });

  test("parses time without seconds", () => {
    const result = parseTime("14:30");
    expect(isPlainTime(result)).toBe(true);
    expect(result.hour).toBe(14);
    expect(result.minute).toBe(30);
  });

  test("parses midnight", () => {
    const result = parseTime("00:00:00");
    expect(result.hour).toBe(0);
    expect(result.minute).toBe(0);
    expect(result.second).toBe(0);
  });

  test("parses end of day", () => {
    const result = parseTime("23:59:59");
    expect(result.hour).toBe(23);
    expect(result.minute).toBe(59);
    expect(result.second).toBe(59);
  });

  test("parses time with fractional seconds", () => {
    const result = parseTime("14:30:45.123456789");
    expect(result.second).toBe(45);
    expect(result.millisecond).toBe(123);
    expect(result.microsecond).toBe(456);
    expect(result.nanosecond).toBe(789);
  });

  test("throws on invalid hour", () => {
    expect(() => parseTime("25:00:00")).toThrow();
  });

  test("throws on invalid minute", () => {
    expect(() => parseTime("14:60:00")).toThrow();
  });

  test("throws on invalid format", () => {
    expect(() => parseTime("2:30 PM")).toThrow();
  });

  test("throws on empty string", () => {
    expect(() => parseTime("")).toThrow();
  });
});

describe("parseTimeOrUndefined", () => {
  test("parses valid time", () => {
    const result = parseTimeOrUndefined("14:30:00");
    expect(isPlainTime(result)).toBe(true);
  });

  test("returns undefined for null", () => {
    expect(parseTimeOrUndefined(null)).toBeUndefined();
  });

  test("returns undefined for undefined", () => {
    expect(parseTimeOrUndefined(undefined)).toBeUndefined();
  });

  test("returns undefined for empty string", () => {
    expect(parseTimeOrUndefined("")).toBeUndefined();
  });
});

// =============================================================================
// parseDateTime
// =============================================================================

describe("parseDateTime", () => {
  test("parses standard ISO datetime", () => {
    const result = parseDateTime("2025-01-15T14:30:00");
    expect(isPlainDateTime(result)).toBe(true);
    expect(result.year).toBe(2025);
    expect(result.month).toBe(1);
    expect(result.day).toBe(15);
    expect(result.hour).toBe(14);
    expect(result.minute).toBe(30);
  });

  test("parses datetime with fractional seconds", () => {
    const result = parseDateTime("2025-01-15T14:30:45.123");
    expect(result.second).toBe(45);
    expect(result.millisecond).toBe(123);
  });

  test("parses midnight datetime", () => {
    const result = parseDateTime("2025-01-15T00:00:00");
    expect(result.hour).toBe(0);
    expect(result.minute).toBe(0);
  });

  test("throws on invalid datetime", () => {
    expect(() => parseDateTime("2025-02-30T14:30:00")).toThrow();
  });

  test("parses date-only string with midnight time", () => {
    // Note: Temporal.PlainDateTime.from accepts date-only strings, defaulting to midnight
    const result = parseDateTime("2025-01-15");
    expect(isPlainDateTime(result)).toBe(true);
    expect(result.hour).toBe(0);
    expect(result.minute).toBe(0);
  });

  test("throws on empty string", () => {
    expect(() => parseDateTime("")).toThrow();
  });
});

describe("parseDateTimeOrUndefined", () => {
  test("parses valid datetime", () => {
    const result = parseDateTimeOrUndefined("2025-01-15T14:30:00");
    expect(isPlainDateTime(result)).toBe(true);
  });

  test("returns undefined for null", () => {
    expect(parseDateTimeOrUndefined(null)).toBeUndefined();
  });

  test("returns undefined for undefined", () => {
    expect(parseDateTimeOrUndefined(undefined)).toBeUndefined();
  });

  test("returns undefined for empty string", () => {
    expect(parseDateTimeOrUndefined("")).toBeUndefined();
  });
});

// =============================================================================
// parseZoned
// =============================================================================

describe("parseZoned", () => {
  test("parses zoned datetime with timezone", () => {
    const result = parseZoned("2025-01-15T14:30:00[America/New_York]");
    expect(isZonedDateTime(result)).toBe(true);
    expect(result.timeZoneId).toBe("America/New_York");
  });

  test("parses zoned datetime with offset and timezone", () => {
    const result = parseZoned("2025-01-15T14:30:00-05:00[America/New_York]");
    expect(isZonedDateTime(result)).toBe(true);
    expect(result.timeZoneId).toBe("America/New_York");
  });

  test("parses UTC timezone", () => {
    const result = parseZoned("2025-01-15T14:30:00+00:00[UTC]");
    expect(result.timeZoneId).toBe("UTC");
  });

  test("parses various timezones", () => {
    expect(parseZoned("2025-01-15T14:30:00[Europe/London]").timeZoneId).toBe("Europe/London");
    expect(parseZoned("2025-01-15T14:30:00[Asia/Tokyo]").timeZoneId).toBe("Asia/Tokyo");
    expect(parseZoned("2025-01-15T14:30:00[Australia/Sydney]").timeZoneId).toBe("Australia/Sydney");
  });

  test("throws on instant without timezone bracket", () => {
    expect(() => parseZoned("2025-01-15T14:30:00Z")).toThrow();
  });

  test("throws on invalid timezone", () => {
    expect(() => parseZoned("2025-01-15T14:30:00[Invalid/Timezone]")).toThrow();
  });

  test("throws on empty string", () => {
    expect(() => parseZoned("")).toThrow();
  });
});

describe("parseZonedOrUndefined", () => {
  test("parses valid zoned datetime", () => {
    const result = parseZonedOrUndefined("2025-01-15T14:30:00[America/New_York]");
    expect(isZonedDateTime(result)).toBe(true);
  });

  test("returns undefined for null", () => {
    expect(parseZonedOrUndefined(null)).toBeUndefined();
  });

  test("returns undefined for undefined", () => {
    expect(parseZonedOrUndefined(undefined)).toBeUndefined();
  });

  test("returns undefined for empty string", () => {
    expect(parseZonedOrUndefined("")).toBeUndefined();
  });
});

// =============================================================================
// parseDuration
// =============================================================================

describe("parseDuration", () => {
  test("parses hours and minutes", () => {
    const result = parseDuration("PT1H30M");
    expect(isDuration(result)).toBe(true);
    expect(result.hours).toBe(1);
    expect(result.minutes).toBe(30);
  });

  test("parses days", () => {
    const result = parseDuration("P1D");
    expect(result.days).toBe(1);
  });

  test("parses years, months, and days", () => {
    const result = parseDuration("P1Y2M3D");
    expect(result.years).toBe(1);
    expect(result.months).toBe(2);
    expect(result.days).toBe(3);
  });

  test("parses weeks", () => {
    const result = parseDuration("P2W");
    expect(result.weeks).toBe(2);
  });

  test("parses full duration", () => {
    const result = parseDuration("P1Y2M3DT4H5M6S");
    expect(result.years).toBe(1);
    expect(result.months).toBe(2);
    expect(result.days).toBe(3);
    expect(result.hours).toBe(4);
    expect(result.minutes).toBe(5);
    expect(result.seconds).toBe(6);
  });

  test("parses seconds with fractional part", () => {
    const result = parseDuration("PT1.5S");
    expect(result.seconds).toBe(1);
    expect(result.milliseconds).toBe(500);
  });

  test("throws on invalid duration format", () => {
    expect(() => parseDuration("1 hour")).toThrow();
  });

  test("throws on empty string", () => {
    expect(() => parseDuration("")).toThrow();
  });

  test("throws on missing P prefix", () => {
    expect(() => parseDuration("T1H")).toThrow();
  });
});

describe("parseDurationOrUndefined", () => {
  test("parses valid duration", () => {
    const result = parseDurationOrUndefined("PT1H30M");
    expect(isDuration(result)).toBe(true);
  });

  test("returns undefined for null", () => {
    expect(parseDurationOrUndefined(null)).toBeUndefined();
  });

  test("returns undefined for undefined", () => {
    expect(parseDurationOrUndefined(undefined)).toBeUndefined();
  });

  test("returns undefined for empty string", () => {
    expect(parseDurationOrUndefined("")).toBeUndefined();
  });
});

// =============================================================================
// Whitespace Validation Tests
// =============================================================================
// The Temporal API is strict about whitespace in ISO strings.
// These tests document that whitespace causes parsing failures.

describe("parseDate whitespace handling", () => {
  test("throws on leading whitespace", () => {
    expect(() => parseDate(" 2025-01-15")).toThrow();
  });

  test("accepts trailing whitespace (Temporal API quirk)", () => {
    // Temporal API tolerates trailing whitespace but not leading
    const result = parseDate("2025-01-15 ");
    expect(isPlainDate(result)).toBe(true);
  });

  test("throws on whitespace-only", () => {
    expect(() => parseDate("   ")).toThrow();
  });
});

describe("parseInstant whitespace handling", () => {
  test("throws on leading whitespace", () => {
    expect(() => parseInstant(" 2025-01-15T14:30:00Z")).toThrow();
  });

  test("throws on trailing whitespace", () => {
    expect(() => parseInstant("2025-01-15T14:30:00Z ")).toThrow();
  });

  test("throws on whitespace-only", () => {
    expect(() => parseInstant("   ")).toThrow();
  });
});

describe("parseTime whitespace handling", () => {
  test("throws on leading whitespace", () => {
    expect(() => parseTime(" 14:30:00")).toThrow();
  });

  test("throws on trailing whitespace", () => {
    expect(() => parseTime("14:30:00 ")).toThrow();
  });
});

describe("isISODate whitespace handling", () => {
  test("returns false for leading whitespace", () => {
    expect(isISODate(" 2025-01-15")).toBe(false);
  });

  test("returns false for trailing whitespace", () => {
    expect(isISODate("2025-01-15 ")).toBe(false);
  });
});

describe("parseDuration whitespace handling", () => {
  test("throws on leading whitespace", () => {
    expect(() => parseDuration(" PT1H30M")).toThrow();
  });

  test("throws on trailing whitespace", () => {
    expect(() => parseDuration("PT1H30M ")).toThrow();
  });
});
