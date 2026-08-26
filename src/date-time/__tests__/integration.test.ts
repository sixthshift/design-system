/**
 * Integration tests - Parse → Utility → Format roundtrips
 * Tests real-world usage patterns from consuming apps
 */

import { describe, expect, test } from "vitest";
import {
  addDays,
  addMonths,
  addWeeks,
  changeTimezone,
  diffInDays,
  diffInMonths,
  endOfMonth,
  endOfWeek,
  // Human-readable formatting
  formatDateLong,
  formatDateTimeTime,
  formatRelative,
  hours,
  isAfter,
  isBefore,
  isInstant,
  // Validation
  isISODate,
  isISODateTime,
  isISOInstant,
  isPast,
  isPlainDate,
  isPlainDateTime,
  isToday,
  minutes,
  // Parsing
  parseDate,
  parseDateTime,
  parseDuration,
  parseInstant,
  parseTime,
  parseZoned,
  // Serialization
  serialize,
  startOfMonth,
  startOfWeek,
  subtractDays,
  // Utilities
  today,
  toMilliseconds,
  toTimezone,
} from "../index";

// =============================================================================
// Parse → Format Roundtrips
// =============================================================================

describe("Parse → Format roundtrips", () => {
  test("date roundtrip preserves value", () => {
    const original = "2025-01-15";
    const parsed = parseDate(original);
    const formatted = serialize(parsed);
    expect(formatted).toBe(original);
  });

  test("datetime roundtrip preserves value", () => {
    const original = "2025-01-15T14:30:00";
    const parsed = parseDateTime(original);
    const formatted = serialize(parsed);
    expect(formatted).toBe(original);
  });

  test("instant roundtrip preserves value", () => {
    const original = "2025-01-15T14:30:00Z";
    const parsed = parseInstant(original);
    const formatted = serialize(parsed);
    expect(formatted).toBe(original);
  });

  test("time roundtrip preserves value", () => {
    const original = "14:30:00";
    const parsed = parseTime(original);
    const formatted = serialize(parsed);
    expect(formatted).toBe(original);
  });

  test("duration roundtrip preserves value", () => {
    const original = "PT1H30M";
    const parsed = parseDuration(original);
    const formatted = serialize(parsed);
    expect(formatted).toBe(original);
  });

  test("zoned datetime roundtrip preserves timezone", () => {
    const original = "2025-01-15T14:30:00-05:00[America/New_York]";
    const parsed = parseZoned(original);
    const formatted = serialize(parsed);
    expect(formatted).toContain("2025-01-15T14:30:00");
    expect(formatted).toContain("[America/New_York]");
  });
});

// =============================================================================
// Parse → Utility → Format Chains
// =============================================================================

describe("Parse → Utility → Format chains", () => {
  test("parse date, add days, format", () => {
    const date = parseDate("2025-01-15");
    const nextWeek = addDays(date, 7);
    expect(serialize(nextWeek)).toBe("2025-01-22");
  });

  test("parse date, subtract days, format", () => {
    const date = parseDate("2025-01-15");
    const lastWeek = subtractDays(date, 7);
    expect(serialize(lastWeek)).toBe("2025-01-08");
  });

  test("parse date, add months, format", () => {
    const date = parseDate("2025-01-15");
    const nextMonth = addMonths(date, 1);
    expect(serialize(nextMonth)).toBe("2025-02-15");
  });

  test("parse date, add weeks, format", () => {
    const date = parseDate("2025-01-15");
    const twoWeeksLater = addWeeks(date, 2);
    expect(serialize(twoWeeksLater)).toBe("2025-01-29");
  });

  test("parse date, get week start, format", () => {
    const date = parseDate("2025-01-15"); // Wednesday
    const weekStart = startOfWeek(date);
    expect(serialize(weekStart)).toBe("2025-01-13"); // Monday
  });

  test("parse date, get month end, format", () => {
    const date = parseDate("2025-01-15");
    const monthEnd = endOfMonth(date);
    expect(serialize(monthEnd)).toBe("2025-01-31");
  });

  test("instant to timezone to local time format", () => {
    const instant = parseInstant("2025-01-15T19:30:00Z");
    const nyTime = toTimezone(instant, "America/New_York");
    // 19:30 UTC = 14:30 EST
    expect(nyTime.hour).toBe(14);
    expect(nyTime.minute).toBe(30);
  });
});

// =============================================================================
// Real-world Scenarios from consuming apps
// =============================================================================

describe("Real-world: Event display (EventItem.tsx)", () => {
  test("parse event datetime and format time", () => {
    // Simulating: const dateTime = parseDateTime(event.start)
    const eventStart = "2025-01-15T14:30:00";
    const dateTime = parseDateTime(eventStart);

    // formatDateTimeTime(dateTime) → "2:30 PM"
    const displayTime = formatDateTimeTime(dateTime);
    expect(displayTime).toBe("2:30 PM");
  });

  test("parse event datetime and format full date", () => {
    const eventStart = "2025-01-15T14:30:00";
    const dateTime = parseDateTime(eventStart);

    const displayDate = formatDateLong(dateTime.toPlainDate());
    expect(displayDate).toBe("Wednesday, January 15");
  });
});

describe("Real-world: Task due dates (TaskItem.tsx)", () => {
  test("parse task due date and format relative", () => {
    // For today
    const todayISO = serialize(today());
    const dueDate = parseDate(todayISO);
    expect(formatRelative(dueDate)).toBe("today");
  });

  test("check if task is overdue", () => {
    // Past date is always overdue
    const pastDate = parseDate("2000-01-01");
    expect(isPast(pastDate)).toBe(true);
  });

  test("format tomorrow task", () => {
    const tomorrow = addDays(today(), 1);
    expect(formatRelative(tomorrow)).toBe("tomorrow");
  });

  test("format task due in few days", () => {
    const in3Days = addDays(today(), 3);
    expect(formatRelative(in3Days)).toBe("in 3 days");
  });
});

describe("Real-world: streak tracking", () => {
  test("generate past week dates", () => {
    const todayDate = today();
    const pastWeek: string[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = subtractDays(todayDate, i);
      pastWeek.push(serialize(date));
    }

    // Should have 7 dates
    expect(pastWeek.length).toBe(7);

    // Last date should be today
    expect(pastWeek[6]).toBe(serialize(todayDate));

    // First date should be 6 days ago
    expect(pastWeek[0]).toBe(serialize(subtractDays(todayDate, 6)));
  });

  test("check if the streak was completed today", () => {
    const todayDate = today();
    expect(isToday(todayDate)).toBe(true);

    const yesterday = subtractDays(todayDate, 1);
    expect(isToday(yesterday)).toBe(false);
  });
});

// =============================================================================
// Complex Workflows
// =============================================================================

describe("Complex: Calendar week view", () => {
  test("generate week dates from any date", () => {
    const date = parseDate("2025-01-15"); // Wednesday
    const weekStart = startOfWeek(date);
    const weekEnd = endOfWeek(date);

    expect(serialize(weekStart)).toBe("2025-01-13"); // Monday
    expect(serialize(weekEnd)).toBe("2025-01-19"); // Sunday

    // Generate all 7 days
    const weekDates: string[] = [];
    let current = weekStart;
    for (let i = 0; i < 7; i++) {
      weekDates.push(serialize(current));
      current = addDays(current, 1);
    }

    expect(weekDates).toEqual(["2025-01-13", "2025-01-14", "2025-01-15", "2025-01-16", "2025-01-17", "2025-01-18", "2025-01-19"]);
  });
});

describe("Complex: Month calendar generation", () => {
  test("generate month dates", () => {
    const date = parseDate("2025-01-15");
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    expect(serialize(monthStart)).toBe("2025-01-01");
    expect(serialize(monthEnd)).toBe("2025-01-31");

    const daysInMonth = diffInDays(monthStart, monthEnd) + 1;
    expect(daysInMonth).toBe(31);
  });

  test("handle February in leap year", () => {
    const date = parseDate("2024-02-15");
    const monthEnd = endOfMonth(date);

    expect(serialize(monthEnd)).toBe("2024-02-29");
  });
});

describe("Complex: Duration calculations", () => {
  test("calculate meeting duration in different units", () => {
    const duration = hours(2);

    expect(toMilliseconds(duration)).toBe(7200000); // 2 hours in ms
    expect(duration.hours).toBe(2);
  });

  test("combine multiple duration helpers", () => {
    const meeting = hours(1);
    const breakTime = minutes(15);

    const totalMinutes = meeting.total({ unit: "minutes" }) + breakTime.total({ unit: "minutes" });
    expect(totalMinutes).toBe(75);
  });

  test("convert minutes to hours", () => {
    const duration = minutes(90);
    const hoursValue = duration.total({ unit: "hours" });
    expect(hoursValue).toBe(1.5);
  });
});

describe("Complex: Timezone handling", () => {
  test("convert instant across timezones", () => {
    const instant = parseInstant("2025-01-15T12:00:00Z");

    // Convert to different timezones
    const nyTime = toTimezone(instant, "America/New_York");
    const tokyoTime = toTimezone(instant, "Asia/Tokyo");

    // NY is UTC-5 in January
    expect(nyTime.hour).toBe(7);
    // Tokyo is UTC+9
    expect(tokyoTime.hour).toBe(21);
  });

  test("change timezone preserves instant", () => {
    const zoned = parseZoned("2025-01-15T14:30:00-05:00[America/New_York]");
    const london = changeTimezone(zoned, "Europe/London");

    // Same moment in time, different local time
    expect(zoned.epochMilliseconds).toBe(london.epochMilliseconds);
    expect(london.hour).toBe(19); // 5 hours ahead
  });
});

// =============================================================================
// Validation + Parsing Chains
// =============================================================================

describe("Validation → Parsing chains", () => {
  test("validate before parsing date", () => {
    const input = "2025-01-15";

    if (isISODate(input)) {
      const date = parseDate(input);
      expect(isPlainDate(date)).toBe(true);
    }
  });

  test("validate before parsing datetime", () => {
    const input = "2025-01-15T14:30:00";

    if (isISODateTime(input)) {
      const dateTime = parseDateTime(input);
      expect(isPlainDateTime(dateTime)).toBe(true);
    }
  });

  test("validate before parsing instant", () => {
    const input = "2025-01-15T14:30:00Z";

    if (isISOInstant(input)) {
      const instant = parseInstant(input);
      expect(isInstant(instant)).toBe(true);
    }
  });

  test("skip invalid input", () => {
    const input = "not-a-date";

    if (isISODate(input)) {
      // Should not reach here
      expect(true).toBe(false);
    } else {
      // Correctly skipped
      expect(true).toBe(true);
    }
  });
});

// =============================================================================
// Date Range Operations
// =============================================================================

describe("Date range operations", () => {
  test("calculate days between dates", () => {
    const start = parseDate("2025-01-01");
    const end = parseDate("2025-01-31");

    const dayCount = diffInDays(start, end);
    expect(dayCount).toBe(30);
  });

  test("calculate months between dates", () => {
    const start = parseDate("2025-01-15");
    const end = parseDate("2025-07-15");

    const monthCount = diffInMonths(start, end);
    expect(monthCount).toBe(6);
  });

  test("check if date is in range", () => {
    const start = parseDate("2025-01-01");
    const end = parseDate("2025-01-31");
    const test = parseDate("2025-01-15");

    const isInRange = !isBefore(test, start) && !isAfter(test, end);
    expect(isInRange).toBe(true);
  });

  test("check if date is outside range", () => {
    const start = parseDate("2025-01-01");
    const end = parseDate("2025-01-31");
    const test = parseDate("2025-02-15");

    const isInRange = !isBefore(test, start) && !isAfter(test, end);
    expect(isInRange).toBe(false);
  });
});
