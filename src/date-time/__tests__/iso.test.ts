import { Temporal } from "@js-temporal/polyfill";
import { describe, expect, it } from "vitest";
import {
  adaptDisabledDates,
  addDaysISO,
  addHoursISO,
  addMinutesISO,
  addMonthsISO,
  compareISO,
  endOfMonthISO,
  endOfWeekISO,
  endOfYearISO,
  fromISODate,
  fromISOInstant,
  fromISOTime,
  isDateString,
  isInstantString,
  isTimeString,
  isWeekendISO,
  startOfMonthISO,
  startOfWeekISO,
  startOfYearISO,
  toISODate,
  toISODateOrUndefined,
  toISODateRange,
  toISOInstant,
  toISOInstantOrUndefined,
  toISOInstantRange,
  toISOTime,
  toISOTimeOrUndefined,
  weekdayISO,
} from "../iso";

// =============================================================================
// Canonical form
//
// Everything a component emits passes through toISO*, so these are the exact
// string shapes that make up the public API.
// =============================================================================

describe("toISODate", () => {
  it("passes a canonical date through unchanged", () => {
    expect(toISODate("2026-08-26")).toBe("2026-08-26");
  });

  it("accepts a Temporal.PlainDate", () => {
    expect(toISODate(Temporal.PlainDate.from("2026-08-26"))).toBe("2026-08-26");
  });

  it("rejects a datetime rather than silently truncating the time", () => {
    expect(() => toISODate("2026-08-26T10:30:00")).toThrow(RangeError);
    expect(() => toISODate("2026-08-26T10:30:00Z")).toThrow(RangeError);
  });

  it("rejects a non-date", () => {
    expect(() => toISODate("not a date")).toThrow();
    expect(() => toISODate("2026-02-30")).toThrow();
  });

  it("normalises an unpadded date", () => {
    expect(toISODate("2026-08-06")).toBe("2026-08-06");
  });
});

describe("toISOTime", () => {
  it("pads HH:MM to canonical HH:MM:SS", () => {
    expect(toISOTime("10:30")).toBe("10:30:00");
  });

  it("passes HH:MM:SS through unchanged", () => {
    expect(toISOTime("10:30:45")).toBe("10:30:45");
  });

  it("accepts a Temporal.PlainTime", () => {
    expect(toISOTime(Temporal.PlainTime.from("10:30"))).toBe("10:30:00");
  });

  it("rejects a datetime, which Temporal.PlainTime.from would otherwise accept", () => {
    // Temporal.PlainTime.from("2026-08-26T10:30:00") succeeds; the boundary
    // must not, or a DateTimePicker value would quietly pass as a time.
    expect(Temporal.PlainTime.from("2026-08-26T10:30:00").toString()).toBe("10:30:00");
    expect(() => toISOTime("2026-08-26T10:30:00")).toThrow(RangeError);
  });

  it("rejects an out-of-range time", () => {
    expect(() => toISOTime("25:00")).toThrow();
    expect(() => toISOTime("10:60")).toThrow();
  });
});

describe("toISOInstant", () => {
  it("passes a canonical UTC instant through unchanged", () => {
    expect(toISOInstant("2026-08-26T00:30:00Z")).toBe("2026-08-26T00:30:00Z");
  });

  it("converts a numeric offset to the Z form, so equal instants compare equal", () => {
    // 10:30+10:00 and 00:30Z are the same instant written two ways.
    expect(toISOInstant("2026-08-26T10:30:00+10:00")).toBe("2026-08-26T00:30:00Z");
    expect(toISOInstant("2026-08-26T10:30:00+10:00")).toBe(toISOInstant("2026-08-26T00:30:00Z"));
  });

  it("accepts a Temporal.Instant", () => {
    expect(toISOInstant(Temporal.Instant.from("2026-08-26T00:30:00Z"))).toBe("2026-08-26T00:30:00Z");
  });

  it("rejects a datetime with no timezone", () => {
    expect(() => toISOInstant("2026-08-26T00:30:00")).toThrow();
  });
});

describe("*OrUndefined", () => {
  it("passes null and undefined through", () => {
    expect(toISODateOrUndefined(undefined)).toBeUndefined();
    expect(toISODateOrUndefined(null)).toBeUndefined();
    expect(toISOTimeOrUndefined(undefined)).toBeUndefined();
    expect(toISOInstantOrUndefined(null)).toBeUndefined();
  });

  it("normalises a present value", () => {
    expect(toISODateOrUndefined("2026-08-26")).toBe("2026-08-26");
    expect(toISOTimeOrUndefined("10:30")).toBe("10:30:00");
  });
});

describe("range normalisation", () => {
  it("normalises both ends", () => {
    expect(toISODateRange({ from: "2026-08-01", to: Temporal.PlainDate.from("2026-08-31") })).toEqual({
      from: "2026-08-01",
      to: "2026-08-31",
    });
  });

  it("keeps a half-open range half-open", () => {
    expect(toISODateRange({ from: "2026-08-01", to: undefined })).toEqual({ from: "2026-08-01", to: undefined });
  });

  it("maps a missing range to undefined", () => {
    expect(toISODateRange(undefined)).toBeUndefined();
    expect(toISOInstantRange(null)).toBeUndefined();
  });

  it("normalises instant range offsets to Z", () => {
    expect(toISOInstantRange({ from: "2026-08-26T10:30:00+10:00", to: "2026-08-27T00:00:00Z" })).toEqual({
      from: "2026-08-26T00:30:00Z",
      to: "2026-08-27T00:00:00Z",
    });
  });
});

// =============================================================================
// Round-tripping
// =============================================================================

describe("widening back to Temporal", () => {
  it("round-trips a date", () => {
    expect(toISODate(fromISODate("2026-08-26"))).toBe("2026-08-26");
  });

  it("rejects a datetime rather than truncating, matching toISODate", () => {
    // Temporal.PlainDate.from would accept this and drop the time silently.
    expect(Temporal.PlainDate.from("2026-08-26T10:00:00").toString()).toBe("2026-08-26");
    expect(() => fromISODate("2026-08-26T10:00:00")).toThrow(RangeError);
  });

  it("rejects a datetime where a time belongs", () => {
    expect(() => fromISOTime("2026-08-26T10:00:00")).toThrow(RangeError);
  });

  it("still accepts an instant written with a numeric offset", () => {
    // fromISOInstant stays permissive on offsets; toISOInstant normalises them.
    expect(fromISOInstant("2026-08-26T10:30:00+10:00").toString()).toBe("2026-08-26T00:30:00Z");
  });

  it("round-trips a time", () => {
    expect(toISOTime(fromISOTime("10:30:45"))).toBe("10:30:45");
  });

  it("round-trips an instant", () => {
    expect(toISOInstant(fromISOInstant("2026-08-26T00:30:00Z"))).toBe("2026-08-26T00:30:00Z");
  });
});

// =============================================================================
// Guards
// =============================================================================

describe("isDateString", () => {
  it("accepts a bare date", () => {
    expect(isDateString("2026-08-26")).toBe(true);
  });

  it("rejects a datetime, unlike the looser isISODate in ./validate", () => {
    expect(isDateString("2026-08-26T10:30:00")).toBe(false);
  });

  it("rejects invalid and non-string input", () => {
    expect(isDateString("2026-02-30")).toBe(false);
    expect(isDateString("nope")).toBe(false);
    expect(isDateString(undefined)).toBe(false);
    expect(isDateString(20260826)).toBe(false);
  });
});

describe("isTimeString", () => {
  it("accepts both precisions", () => {
    expect(isTimeString("10:30")).toBe(true);
    expect(isTimeString("10:30:45")).toBe(true);
  });

  it("rejects a datetime", () => {
    expect(isTimeString("2026-08-26T10:30:00")).toBe(false);
  });

  it("rejects an out-of-range time", () => {
    expect(isTimeString("25:00")).toBe(false);
  });
});

describe("isInstantString", () => {
  it("accepts Z and numeric offsets", () => {
    expect(isInstantString("2026-08-26T00:30:00Z")).toBe(true);
    expect(isInstantString("2026-08-26T10:30:00+10:00")).toBe(true);
  });

  it("rejects a value with no timezone", () => {
    expect(isInstantString("2026-08-26T00:30:00")).toBe(false);
    expect(isInstantString("2026-08-26")).toBe(false);
  });
});

// =============================================================================
// Comparison
//
// The reason compareISO exists rather than raw `<`.
// =============================================================================

describe("compareISO", () => {
  it("orders dates", () => {
    expect(compareISO("2026-08-26", "2026-08-27")).toBeLessThan(0);
    expect(compareISO("2026-08-27", "2026-08-26")).toBeGreaterThan(0);
    expect(compareISO("2026-08-26", "2026-08-26")).toBe(0);
  });

  it("treats mixed time precision as equal where raw string compare would not", () => {
    expect("10:30" < "10:30:00").toBe(true); // raw strings: wrong
    expect(compareISO("10:30", "10:30:00")).toBe(0); // normalised: right
  });

  it("orders instants across mixed precision, where raw string compare fails", () => {
    // Equal up to the minute, then ":" (0x3A) sorts below "Z" (0x5A) — so a raw
    // compare puts the later instant first. This is the case that makes
    // normalising on entry mandatory rather than merely tidy.
    const later = "2026-08-26T00:30:00.250Z";
    const earlier = "2026-08-26T00:30Z";
    expect(later < earlier).toBe(true); // raw strings: wrong
    expect(compareISO(later, earlier)).toBeGreaterThan(0); // normalised: right
  });

  it("orders instants written with different offsets", () => {
    expect(compareISO("2026-08-26T10:30:00+10:00", "2026-08-26T00:30:00Z")).toBe(0);
  });
});

// =============================================================================
// ISO-native arithmetic
// =============================================================================

describe("addDaysISO", () => {
  it("adds and subtracts", () => {
    expect(addDaysISO("2026-08-26", 7)).toBe("2026-09-02");
    expect(addDaysISO("2026-08-26", -7)).toBe("2026-08-19");
  });

  it("crosses a year boundary", () => {
    expect(addDaysISO("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("handles a leap day", () => {
    expect(addDaysISO("2028-02-28", 1)).toBe("2028-02-29");
  });
});

describe("addMonthsISO", () => {
  it("adds months", () => {
    expect(addMonthsISO("2026-08-26", 1)).toBe("2026-09-26");
  });

  it("clamps the day to the target month's length", () => {
    expect(addMonthsISO("2026-01-31", 1)).toBe("2026-02-28");
  });
});

describe("instant arithmetic", () => {
  it("adds and subtracts minutes", () => {
    expect(addMinutesISO("2026-08-26T00:30:00Z", 45)).toBe("2026-08-26T01:15:00Z");
    expect(addMinutesISO("2026-08-26T00:30:00Z", -45)).toBe("2026-08-25T23:45:00Z");
  });

  it("adds and subtracts hours", () => {
    expect(addHoursISO("2026-08-26T00:30:00Z", 2)).toBe("2026-08-26T02:30:00Z");
    expect(addHoursISO("2026-08-26T00:30:00Z", -1)).toBe("2026-08-25T23:30:00Z");
  });

  it("normalises a non-Z input to the Z form on the way out", () => {
    expect(addHoursISO("2026-08-26T10:30:00+10:00" as never, 1)).toBe("2026-08-26T01:30:00Z");
  });
});

describe("year boundaries", () => {
  it("finds the first and last day of the year", () => {
    expect(startOfYearISO("2026-08-26")).toBe("2026-01-01");
    expect(endOfYearISO("2026-08-26")).toBe("2026-12-31");
  });
});

describe("month boundaries", () => {
  it("finds the first and last day", () => {
    expect(startOfMonthISO("2026-08-26")).toBe("2026-08-01");
    expect(endOfMonthISO("2026-08-26")).toBe("2026-08-31");
  });

  it("handles February in a leap year", () => {
    expect(endOfMonthISO("2028-02-10")).toBe("2028-02-29");
  });
});

describe("week boundaries", () => {
  // 2026-08-26 is a Wednesday.
  it("defaults to a Sunday week start", () => {
    expect(startOfWeekISO("2026-08-26")).toBe("2026-08-23");
    expect(endOfWeekISO("2026-08-26")).toBe("2026-08-29");
  });

  it("honours a Monday week start", () => {
    expect(startOfWeekISO("2026-08-26", 1)).toBe("2026-08-24");
    expect(endOfWeekISO("2026-08-26", 1)).toBe("2026-08-30");
  });

  it("is idempotent on a day that already starts the week", () => {
    expect(startOfWeekISO("2026-08-23")).toBe("2026-08-23");
    expect(startOfWeekISO("2026-08-24", 1)).toBe("2026-08-24");
  });
});

describe("weekdayISO", () => {
  it("names every day of a week starting Monday", () => {
    // 2026-08-24 is a Monday.
    expect(["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((_, i) => weekdayISO(addDaysISO("2026-08-24", i)))).toEqual([
      "mon",
      "tue",
      "wed",
      "thu",
      "fri",
      "sat",
      "sun",
    ]);
  });
});

describe("isWeekendISO", () => {
  it("is true for Saturday and Sunday only", () => {
    expect(isWeekendISO("2026-08-29")).toBe(true); // Saturday
    expect(isWeekendISO("2026-08-30")).toBe(true); // Sunday
    expect(isWeekendISO("2026-08-28")).toBe(false); // Friday
    expect(isWeekendISO("2026-08-31")).toBe(false); // Monday
  });

  it("lets a consumer filter dates without touching Temporal", () => {
    const week = Array.from({ length: 7 }, (_, i) => addDaysISO("2026-08-24", i));
    expect(week.filter((date) => !isWeekendISO(date))).toEqual(["2026-08-24", "2026-08-25", "2026-08-26", "2026-08-27", "2026-08-28"]);
  });
});

// =============================================================================
// Disabled-date adaptation
//
// Each adapted matcher is checked by evaluating it the way calendar.hooks does.
// =============================================================================

const AUG_26 = Temporal.PlainDate.from("2026-08-26"); // Wednesday
const AUG_29 = Temporal.PlainDate.from("2026-08-29"); // Saturday

describe("adaptDisabledDates", () => {
  it("passes undefined through", () => {
    expect(adaptDisabledDates(undefined)).toBeUndefined();
  });

  it("adapts a single date", () => {
    const adapted = adaptDisabledDates("2026-08-26");
    expect(adapted).toBeInstanceOf(Temporal.PlainDate);
    expect(String(adapted)).toBe("2026-08-26");
  });

  it("adapts an array of dates as one matcher", () => {
    const adapted = adaptDisabledDates(["2026-08-26", "2026-08-27"]);
    expect(Array.isArray(adapted)).toBe(true);
    expect((adapted as Temporal.PlainDate[]).map(String)).toEqual(["2026-08-26", "2026-08-27"]);
  });

  it("adapts before/after into Temporal bounds", () => {
    expect(String((adaptDisabledDates({ before: "2026-01-01" }) as { before: Temporal.PlainDate }).before)).toBe("2026-01-01");
    expect(String((adaptDisabledDates({ after: "2026-12-31" }) as { after: Temporal.PlainDate }).after)).toBe("2026-12-31");
  });

  it("adapts a from/to span", () => {
    const adapted = adaptDisabledDates({ from: "2026-08-01", to: "2026-08-07" }) as {
      from: Temporal.PlainDate;
      to: Temporal.PlainDate;
    };
    expect([String(adapted.from), String(adapted.to)]).toEqual(["2026-08-01", "2026-08-07"]);
  });

  it("turns a consumer predicate into a Temporal predicate", () => {
    const adapted = adaptDisabledDates((date) => date === "2026-08-26") as (d: Temporal.PlainDate) => boolean;
    expect(adapted(AUG_26)).toBe(true);
    expect(adapted(AUG_29)).toBe(false);
  });

  it("hands the predicate a canonical ISO date string", () => {
    let seen: string | undefined;
    const adapted = adaptDisabledDates((date) => {
      seen = date;
      return false;
    }) as (d: Temporal.PlainDate) => boolean;
    adapted(AUG_26);
    expect(seen).toBe("2026-08-26");
  });

  it("turns dayOfWeek into a predicate matching the named days", () => {
    const adapted = adaptDisabledDates({ dayOfWeek: ["sat", "sun"] }) as (d: Temporal.PlainDate) => boolean;
    expect(adapted(AUG_29)).toBe(true); // Saturday
    expect(adapted(Temporal.PlainDate.from("2026-08-30"))).toBe(true); // Sunday
    expect(adapted(AUG_26)).toBe(false); // Wednesday
  });

  it("maps every weekday name to the right ISO day number", () => {
    // 2026-08-24 is a Monday, so this week covers mon..sun in order.
    const week = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
    week.forEach((name, index) => {
      const matcher = adaptDisabledDates({ dayOfWeek: [name] }) as (d: Temporal.PlainDate) => boolean;
      const date = Temporal.PlainDate.from("2026-08-24").add({ days: index });
      expect(matcher(date), `${name} should match ${date}`).toBe(true);
    });
  });

  it("adapts a mixed list of matchers", () => {
    const adapted = adaptDisabledDates([{ before: "2026-01-01" }, { dayOfWeek: ["sun"] }]);
    expect(Array.isArray(adapted)).toBe(true);
    expect(adapted).toHaveLength(2);
  });
});
