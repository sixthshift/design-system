/**
 * Tests for validate.ts - ISO string validation and type guards
 */

import { describe, expect, test } from "vitest";
import {
  isDuration,
  isInstant,
  // String validators
  isISODate,
  isISODateTime,
  isISODuration,
  isISOInstant,
  isISOString,
  isISOTime,
  isISOZoned,
  // Type guards
  isPlainDate,
  isPlainDateTime,
  isPlainTime,
  isTemporal,
  isZonedDateTime,
  // For creating test values
  parseDate,
  parseDateTime,
  parseDuration,
  parseInstant,
  parseTime,
  parseZoned,
  // Validation with errors
  validateISODate,
  validateISODuration,
  validateISOInstant,
  validateISOZoned,
} from "../index";

// =============================================================================
// isISODate
// =============================================================================

describe("isISODate", () => {
  test("returns true for valid ISO date", () => {
    expect(isISODate("2025-01-15")).toBe(true);
  });

  test("returns true for leap year date", () => {
    expect(isISODate("2024-02-29")).toBe(true);
  });

  test("returns true for end of month dates", () => {
    expect(isISODate("2025-01-31")).toBe(true);
    expect(isISODate("2025-04-30")).toBe(true);
  });

  test("returns false for invalid date", () => {
    expect(isISODate("2025-02-30")).toBe(false); // Feb 30 doesn't exist
    expect(isISODate("2025-13-01")).toBe(false); // Invalid month
    expect(isISODate("2025-02-29")).toBe(false); // Not a leap year
  });

  test("returns false for wrong format", () => {
    expect(isISODate("01-15-2025")).toBe(false);
    expect(isISODate("15/01/2025")).toBe(false);
    expect(isISODate("January 15, 2025")).toBe(false);
  });

  test("returns false for non-string types", () => {
    expect(isISODate(null)).toBe(false);
    expect(isISODate(undefined)).toBe(false);
    expect(isISODate(12345)).toBe(false);
    expect(isISODate({})).toBe(false);
    expect(isISODate([])).toBe(false);
  });

  test("returns false for empty string", () => {
    expect(isISODate("")).toBe(false);
  });

  test("returns true for datetime strings without timezone", () => {
    // Note: Temporal.PlainDate.from() accepts datetime strings, extracting only the date part
    expect(isISODate("2025-01-15T14:30:00")).toBe(true);
  });

  test("returns false for instant strings (with Z)", () => {
    // Temporal.PlainDate.from() rejects strings with Z designator
    expect(isISODate("2025-01-15T14:30:00Z")).toBe(false);
  });
});

// =============================================================================
// isISOTime
// =============================================================================

describe("isISOTime", () => {
  test("returns true for valid time with seconds", () => {
    expect(isISOTime("14:30:00")).toBe(true);
  });

  test("returns true for valid time without seconds", () => {
    expect(isISOTime("14:30")).toBe(true);
  });

  test("returns true for midnight", () => {
    expect(isISOTime("00:00:00")).toBe(true);
  });

  test("returns true for end of day", () => {
    expect(isISOTime("23:59:59")).toBe(true);
  });

  test("returns true for time with fractional seconds", () => {
    expect(isISOTime("14:30:45.123")).toBe(true);
  });

  test("returns false for invalid hour", () => {
    expect(isISOTime("25:00:00")).toBe(false);
  });

  test("returns false for invalid minute", () => {
    expect(isISOTime("14:60:00")).toBe(false);
  });

  test("returns false for 12-hour format", () => {
    expect(isISOTime("2:30 PM")).toBe(false);
  });

  test("returns false for non-string types", () => {
    expect(isISOTime(null)).toBe(false);
    expect(isISOTime(undefined)).toBe(false);
    expect(isISOTime(1430)).toBe(false);
  });
});

// =============================================================================
// isISODateTime
// =============================================================================

describe("isISODateTime", () => {
  test("returns true for valid datetime", () => {
    expect(isISODateTime("2025-01-15T14:30:00")).toBe(true);
  });

  test("returns true for datetime with fractional seconds", () => {
    expect(isISODateTime("2025-01-15T14:30:45.123")).toBe(true);
  });

  test("returns true for datetime at midnight", () => {
    expect(isISODateTime("2025-01-15T00:00:00")).toBe(true);
  });

  test("returns true for date-only (Temporal defaults to midnight)", () => {
    // Note: Temporal.PlainDateTime.from() accepts date-only strings, defaulting to midnight
    expect(isISODateTime("2025-01-15")).toBe(true);
  });

  test("returns false for time-only", () => {
    expect(isISODateTime("14:30:00")).toBe(false);
  });

  test("returns false for invalid datetime", () => {
    expect(isISODateTime("2025-02-30T14:30:00")).toBe(false);
  });

  test("returns false for non-string types", () => {
    expect(isISODateTime(null)).toBe(false);
    expect(isISODateTime(undefined)).toBe(false);
  });
});

// =============================================================================
// isISOInstant
// =============================================================================

describe("isISOInstant", () => {
  test("returns true for UTC instant", () => {
    expect(isISOInstant("2025-01-15T14:30:00Z")).toBe(true);
    expect(isISOInstant("2025-01-15T14:30:00.000Z")).toBe(true);
  });

  test("returns true for instant with positive offset", () => {
    expect(isISOInstant("2025-01-15T14:30:00+05:30")).toBe(true);
  });

  test("returns true for instant with negative offset", () => {
    expect(isISOInstant("2025-01-15T14:30:00-08:00")).toBe(true);
  });

  test("returns false for datetime without timezone", () => {
    expect(isISOInstant("2025-01-15T14:30:00")).toBe(false);
  });

  test("returns false for date-only", () => {
    expect(isISOInstant("2025-01-15")).toBe(false);
  });

  test("returns false for non-string types", () => {
    expect(isISOInstant(null)).toBe(false);
    expect(isISOInstant(undefined)).toBe(false);
  });
});

// =============================================================================
// isISOZoned
// =============================================================================

describe("isISOZoned", () => {
  test("returns true for zoned datetime with timezone", () => {
    expect(isISOZoned("2025-01-15T14:30:00[America/New_York]")).toBe(true);
  });

  test("returns true for zoned datetime with offset and timezone", () => {
    expect(isISOZoned("2025-01-15T14:30:00-05:00[America/New_York]")).toBe(true);
  });

  test("returns true for UTC timezone", () => {
    expect(isISOZoned("2025-01-15T14:30:00+00:00[UTC]")).toBe(true);
  });

  test("returns false for instant without bracket notation", () => {
    expect(isISOZoned("2025-01-15T14:30:00Z")).toBe(false);
  });

  test("returns false for datetime without timezone", () => {
    expect(isISOZoned("2025-01-15T14:30:00")).toBe(false);
  });

  test("returns false for invalid timezone", () => {
    expect(isISOZoned("2025-01-15T14:30:00[Invalid/Timezone]")).toBe(false);
  });

  test("returns false for non-string types", () => {
    expect(isISOZoned(null)).toBe(false);
    expect(isISOZoned(undefined)).toBe(false);
  });
});

// =============================================================================
// isISODuration
// =============================================================================

describe("isISODuration", () => {
  test("returns true for hours and minutes", () => {
    expect(isISODuration("PT1H30M")).toBe(true);
  });

  test("returns true for days", () => {
    expect(isISODuration("P1D")).toBe(true);
  });

  test("returns true for weeks", () => {
    expect(isISODuration("P2W")).toBe(true);
  });

  test("returns true for full duration", () => {
    expect(isISODuration("P1Y2M3DT4H5M6S")).toBe(true);
  });

  test("returns false for human-readable format", () => {
    expect(isISODuration("1 hour")).toBe(false);
    expect(isISODuration("30 minutes")).toBe(false);
  });

  test("returns false for missing P prefix", () => {
    expect(isISODuration("T1H30M")).toBe(false);
  });

  test("returns false for non-string types", () => {
    expect(isISODuration(null)).toBe(false);
    expect(isISODuration(undefined)).toBe(false);
    expect(isISODuration(3600)).toBe(false);
  });
});

// =============================================================================
// isISOString
// =============================================================================

describe("isISOString", () => {
  test("returns true for date", () => {
    expect(isISOString("2025-01-15")).toBe(true);
  });

  test("returns true for time", () => {
    expect(isISOString("14:30:00")).toBe(true);
  });

  test("returns true for datetime", () => {
    expect(isISOString("2025-01-15T14:30:00")).toBe(true);
  });

  test("returns true for instant", () => {
    expect(isISOString("2025-01-15T14:30:00Z")).toBe(true);
  });

  test("returns true for zoned datetime", () => {
    expect(isISOString("2025-01-15T14:30:00[America/New_York]")).toBe(true);
  });

  test("returns false for invalid strings", () => {
    expect(isISOString("not a date")).toBe(false);
    expect(isISOString("")).toBe(false);
  });

  test("returns false for non-string types", () => {
    expect(isISOString(null)).toBe(false);
    expect(isISOString(undefined)).toBe(false);
  });
});

// =============================================================================
// Type Guards - isPlainDate
// =============================================================================

describe("isPlainDate", () => {
  test("returns true for PlainDate", () => {
    const date = parseDate("2025-01-15");
    expect(isPlainDate(date)).toBe(true);
  });

  test("returns false for other Temporal types", () => {
    expect(isPlainDate(parseTime("14:30:00"))).toBe(false);
    expect(isPlainDate(parseDateTime("2025-01-15T14:30:00"))).toBe(false);
    expect(isPlainDate(parseInstant("2025-01-15T14:30:00Z"))).toBe(false);
  });

  test("returns false for primitives", () => {
    expect(isPlainDate("2025-01-15")).toBe(false);
    expect(isPlainDate(null)).toBe(false);
    expect(isPlainDate(undefined)).toBe(false);
    expect(isPlainDate({})).toBe(false);
  });
});

// =============================================================================
// Type Guards - isPlainTime
// =============================================================================

describe("isPlainTime", () => {
  test("returns true for PlainTime", () => {
    const time = parseTime("14:30:00");
    expect(isPlainTime(time)).toBe(true);
  });

  test("returns false for other Temporal types", () => {
    expect(isPlainTime(parseDate("2025-01-15"))).toBe(false);
    expect(isPlainTime(parseDateTime("2025-01-15T14:30:00"))).toBe(false);
  });

  test("returns false for primitives", () => {
    expect(isPlainTime("14:30:00")).toBe(false);
    expect(isPlainTime(null)).toBe(false);
  });
});

// =============================================================================
// Type Guards - isPlainDateTime
// =============================================================================

describe("isPlainDateTime", () => {
  test("returns true for PlainDateTime", () => {
    const dateTime = parseDateTime("2025-01-15T14:30:00");
    expect(isPlainDateTime(dateTime)).toBe(true);
  });

  test("returns false for other Temporal types", () => {
    expect(isPlainDateTime(parseDate("2025-01-15"))).toBe(false);
    expect(isPlainDateTime(parseTime("14:30:00"))).toBe(false);
    expect(isPlainDateTime(parseInstant("2025-01-15T14:30:00Z"))).toBe(false);
  });

  test("returns false for primitives", () => {
    expect(isPlainDateTime("2025-01-15T14:30:00")).toBe(false);
    expect(isPlainDateTime(null)).toBe(false);
  });
});

// =============================================================================
// Type Guards - isInstant
// =============================================================================

describe("isInstant", () => {
  test("returns true for Instant", () => {
    const instant = parseInstant("2025-01-15T14:30:00Z");
    expect(isInstant(instant)).toBe(true);
  });

  test("returns false for other Temporal types", () => {
    expect(isInstant(parseDate("2025-01-15"))).toBe(false);
    expect(isInstant(parseDateTime("2025-01-15T14:30:00"))).toBe(false);
    expect(isInstant(parseZoned("2025-01-15T14:30:00[America/New_York]"))).toBe(false);
  });

  test("returns false for primitives", () => {
    expect(isInstant("2025-01-15T14:30:00Z")).toBe(false);
    expect(isInstant(null)).toBe(false);
  });
});

// =============================================================================
// Type Guards - isZonedDateTime
// =============================================================================

describe("isZonedDateTime", () => {
  test("returns true for ZonedDateTime", () => {
    const zoned = parseZoned("2025-01-15T14:30:00[America/New_York]");
    expect(isZonedDateTime(zoned)).toBe(true);
  });

  test("returns false for other Temporal types", () => {
    expect(isZonedDateTime(parseDate("2025-01-15"))).toBe(false);
    expect(isZonedDateTime(parseInstant("2025-01-15T14:30:00Z"))).toBe(false);
  });

  test("returns false for primitives", () => {
    expect(isZonedDateTime("2025-01-15T14:30:00[America/New_York]")).toBe(false);
    expect(isZonedDateTime(null)).toBe(false);
  });
});

// =============================================================================
// Type Guards - isDuration
// =============================================================================

describe("isDuration", () => {
  test("returns true for Duration", () => {
    const duration = parseDuration("PT1H30M");
    expect(isDuration(duration)).toBe(true);
  });

  test("returns false for other Temporal types", () => {
    expect(isDuration(parseDate("2025-01-15"))).toBe(false);
    expect(isDuration(parseInstant("2025-01-15T14:30:00Z"))).toBe(false);
  });

  test("returns false for primitives", () => {
    expect(isDuration("PT1H30M")).toBe(false);
    expect(isDuration(3600)).toBe(false);
    expect(isDuration(null)).toBe(false);
  });
});

// =============================================================================
// Type Guards - isTemporal
// =============================================================================

describe("isTemporal", () => {
  test("returns true for all Temporal types", () => {
    expect(isTemporal(parseDate("2025-01-15"))).toBe(true);
    expect(isTemporal(parseTime("14:30:00"))).toBe(true);
    expect(isTemporal(parseDateTime("2025-01-15T14:30:00"))).toBe(true);
    expect(isTemporal(parseInstant("2025-01-15T14:30:00Z"))).toBe(true);
    expect(isTemporal(parseZoned("2025-01-15T14:30:00[America/New_York]"))).toBe(true);
    expect(isTemporal(parseDuration("PT1H30M"))).toBe(true);
  });

  test("returns false for primitives", () => {
    expect(isTemporal("2025-01-15")).toBe(false);
    expect(isTemporal(12345)).toBe(false);
    expect(isTemporal(null)).toBe(false);
    expect(isTemporal(undefined)).toBe(false);
    expect(isTemporal({})).toBe(false);
  });
});

// =============================================================================
// Validation with Errors - validateISODate
// =============================================================================

describe("validateISODate", () => {
  test("returns valid for correct date", () => {
    const result = validateISODate("2025-01-15");
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test("returns invalid with error for wrong type", () => {
    const result = validateISODate(12345);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Expected string, got number");
  });

  test("returns invalid with error for null", () => {
    const result = validateISODate(null);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Expected string, got object");
  });

  test("returns invalid with error message for bad date", () => {
    const result = validateISODate("2025-02-30");
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  test("returns invalid with error for invalid format", () => {
    const result = validateISODate("not-a-date");
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });
});

// =============================================================================
// Validation with Errors - validateISOInstant
// =============================================================================

describe("validateISOInstant", () => {
  test("returns valid for correct instant", () => {
    const result = validateISOInstant("2025-01-15T14:30:00Z");
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test("returns invalid with error for wrong type", () => {
    const result = validateISOInstant(12345);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Expected string, got number");
  });

  test("returns invalid with error for datetime without timezone", () => {
    const result = validateISOInstant("2025-01-15T14:30:00");
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });
});

// =============================================================================
// Validation with Errors - validateISOZoned
// =============================================================================

describe("validateISOZoned", () => {
  test("returns valid for correct zoned datetime", () => {
    const result = validateISOZoned("2025-01-15T14:30:00[America/New_York]");
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test("returns invalid with error for wrong type", () => {
    const result = validateISOZoned(12345);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Expected string, got number");
  });

  test("returns invalid with error for missing brackets", () => {
    const result = validateISOZoned("2025-01-15T14:30:00Z");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Zoned datetime must include timezone in brackets, e.g. [America/New_York]");
  });

  test("returns invalid with error for invalid timezone", () => {
    const result = validateISOZoned("2025-01-15T14:30:00[Invalid/Timezone]");
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });
});

// =============================================================================
// Validation with Errors - validateISODuration
// =============================================================================

describe("validateISODuration", () => {
  test("returns valid for correct duration", () => {
    const result = validateISODuration("PT1H30M");
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test("returns invalid with error for wrong type", () => {
    const result = validateISODuration(3600);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Expected string, got number");
  });

  test("returns invalid with error for invalid format", () => {
    const result = validateISODuration("1 hour");
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });
});
