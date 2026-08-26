/**
 * ISO 8601 string types — the public boundary of every date/time component.
 *
 * Components accept and emit canonical ISO strings, never Temporal objects. That
 * keeps the engine (Temporal today, native Temporal or something else tomorrow)
 * an implementation detail, and it means a consumer never has to adopt a date
 * library to render a date picker.
 *
 * Two properties this module guarantees, which the components rely on:
 *
 * 1. **Canonical form.** Every value produced by `toISO*` is normalised via
 *    Temporal, so precision is fixed: dates are `YYYY-MM-DD`, times are
 *    `HH:MM:SS`, instants are `YYYY-MM-DDTHH:MM:SSZ`. Consumer input is *not*
 *    canonical — `"10:30"` and `"10:30:00"` are both valid input — so always
 *    normalise on entry rather than comparing raw props.
 *
 * 2. **Lexicographic order == chronological order**, but only once canonical.
 *    `"2026-08-26T00:30:00.250Z" < "2026-08-26T00:30Z"` sorts wrong as raw
 *    strings; both normalise to a form where `<` is correct. Compare with
 *    {@link compareISO}, never with `<` on a raw prop.
 */

import { Temporal } from "@js-temporal/polyfill";
import type { WeekStartsOn } from "./boundaries";

// =============================================================================
// Types
// =============================================================================

/** Any numeric segment of an ISO string. */
type N = `${number}`;

/**
 * An ISO 8601 calendar date: `YYYY-MM-DD`.
 *
 * The template literal rejects the obvious mistakes at compile time for literal
 * values (a datetime passed where a date belongs, or outright garbage). It
 * cannot check a value that arrives as a plain `string` — use
 * {@link toISODate} for those.
 *
 * @example
 * const d: ISODate = "2026-08-26";       // ok
 * const d: ISODate = "2026-08-26T10:00"; // Error
 */
export type ISODate = `${N}-${N}-${N}`;

/**
 * An ISO 8601 wall-clock time: `HH:MM` or `HH:MM:SS`.
 *
 * Both precisions are accepted as input; components always emit `HH:MM:SS`.
 */
export type ISOTime = `${N}:${N}` | `${N}:${N}:${N}`;

/** An ISO 8601 timezone-naive datetime: `YYYY-MM-DDTHH:MM:SS`. */
export type ISODateTime = `${ISODate}T${ISOTime}`;

/**
 * An ISO 8601 absolute instant in UTC: `YYYY-MM-DDTHH:MM:SSZ`.
 *
 * The trailing `Z` is required. A numeric offset (`+10:00`) is a valid instant
 * to Temporal but is rejected here, so that one instant has exactly one
 * representation and string comparison stays meaningful.
 */
export type ISOInstant = `${ISODate}T${string}Z`;

/** A date range, either end of which may be unset. */
export type ISODateRange = {
  from: ISODate | undefined;
  to: ISODate | undefined;
};

/** An instant range, either end of which may be unset. */
export type ISOInstantRange = {
  from: ISOInstant | undefined;
  to: ISOInstant | undefined;
};

/**
 * Day of week by name.
 *
 * Named rather than numbered on purpose: `weekStartsOn` counts from 0 = Sunday
 * while ISO-8601 `dayOfWeek` counts from 1 = Monday, and two numeric day props
 * with different origins in the same object is a bug waiting to be filed.
 */
export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

/** ISO-8601 day numbers, indexed by {@link Weekday}. 1 = Monday. */
const WEEKDAY_NUMBER: Record<Weekday, number> = {
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  sun: 7,
};

/**
 * Which dates a calendar should refuse.
 *
 * The declarative forms cover the cases that would otherwise force a consumer
 * to do date arithmetic; the predicate remains as an escape hatch.
 *
 * @example
 * disabled="2026-08-26"                        // one date
 * disabled={["2026-08-26", "2026-08-27"]}      // several
 * disabled={{ before: "2026-01-01" }}          // everything earlier
 * disabled={{ from: "2026-08-01", to: "2026-08-07" }}  // an inclusive span
 * disabled={{ dayOfWeek: ["sat", "sun"] }}     // weekends
 * disabled={(date) => date.endsWith("-01")}    // anything else
 */
export type DisabledDates =
  | ISODate
  | readonly ISODate[]
  | { before: ISODate }
  | { after: ISODate }
  | { from: ISODate; to: ISODate }
  | { dayOfWeek: readonly Weekday[] }
  | ((date: ISODate) => boolean);

// =============================================================================
// Narrowing: string | Temporal -> canonical branded ISO
// =============================================================================

/**
 * Normalise a date to canonical `YYYY-MM-DD`.
 *
 * Accepts an ISO date string or a `Temporal.PlainDate`. Throws on anything that
 * is not a valid date, and on a datetime string — a value carrying a time is a
 * caller mistake here, not something to silently truncate.
 */
export function toISODate(value: string | Temporal.PlainDate): ISODate {
  if (value instanceof Temporal.PlainDate) return value.toString() as ISODate;
  if (/[T ]/.test(value)) {
    throw new RangeError(`Expected an ISO date (YYYY-MM-DD), got a datetime: ${value}`);
  }
  return Temporal.PlainDate.from(value).toString() as ISODate;
}

/** {@link toISODate}, passing `undefined` through. */
export function toISODateOrUndefined(value: string | Temporal.PlainDate | null | undefined): ISODate | undefined {
  return value === null || value === undefined ? undefined : toISODate(value);
}

/**
 * Normalise a time to canonical `HH:MM:SS`.
 *
 * Accepts `HH:MM`, `HH:MM:SS`, or a `Temporal.PlainTime`. Rejects a datetime,
 * which `Temporal.PlainTime.from` would otherwise happily accept.
 */
export function toISOTime(value: string | Temporal.PlainTime): ISOTime {
  if (value instanceof Temporal.PlainTime) return value.toString() as ISOTime;
  if (/[T ]/.test(value)) {
    throw new RangeError(`Expected an ISO time (HH:MM or HH:MM:SS), got a datetime: ${value}`);
  }
  return Temporal.PlainTime.from(value).toString() as ISOTime;
}

/** {@link toISOTime}, passing `undefined` through. */
export function toISOTimeOrUndefined(value: string | Temporal.PlainTime | null | undefined): ISOTime | undefined {
  return value === null || value === undefined ? undefined : toISOTime(value);
}

/**
 * Normalise an instant to canonical `YYYY-MM-DDTHH:MM:SSZ` (UTC).
 *
 * Accepts any ISO instant — including one written with a numeric offset — and
 * converts it to the `Z` form, so equal instants always compare equal as
 * strings.
 */
export function toISOInstant(value: string | Temporal.Instant): ISOInstant {
  const instant = value instanceof Temporal.Instant ? value : Temporal.Instant.from(value);
  return instant.toString() as ISOInstant;
}

/** {@link toISOInstant}, passing `undefined` through. */
export function toISOInstantOrUndefined(value: string | Temporal.Instant | null | undefined): ISOInstant | undefined {
  return value === null || value === undefined ? undefined : toISOInstant(value);
}

/** Normalise a date range, dropping ends that are unset. */
export function toISODateRange(
  range: { from?: string | Temporal.PlainDate | undefined; to?: string | Temporal.PlainDate | undefined } | null | undefined
): ISODateRange | undefined {
  if (!range) return undefined;
  return { from: toISODateOrUndefined(range.from), to: toISODateOrUndefined(range.to) };
}

/** Normalise an instant range, dropping ends that are unset. */
export function toISOInstantRange(
  range: { from?: string | Temporal.Instant | undefined; to?: string | Temporal.Instant | undefined } | null | undefined
): ISOInstantRange | undefined {
  if (!range) return undefined;
  return { from: toISOInstantOrUndefined(range.from), to: toISOInstantOrUndefined(range.to) };
}

// =============================================================================
// Widening: branded ISO -> Temporal (for component internals)
// =============================================================================

/**
 * Parse an {@link ISODate} to the `Temporal.PlainDate` the internals work in.
 *
 * Rejects a value carrying a time, exactly as {@link toISODate} does. The
 * template literal type already catches that for a literal, but a value arriving
 * as `string` from an API is unchecked — and `Temporal.PlainDate.from` would
 * silently truncate `"2026-08-26T10:00:00"` to `2026-08-26`, which is the kind
 * of quiet wrong answer this boundary exists to prevent.
 */
export function fromISODate(value: ISODate | string): Temporal.PlainDate {
  if (/[T ]/.test(value)) {
    throw new RangeError(`Expected an ISO date (YYYY-MM-DD), got a datetime: ${value}`);
  }
  return Temporal.PlainDate.from(value);
}

/** {@link fromISODate}, passing `undefined` through. */
export function fromISODateOrUndefined(value: ISODate | string | null | undefined): Temporal.PlainDate | undefined {
  return value === null || value === undefined ? undefined : fromISODate(value);
}

/**
 * Parse an {@link ISOTime} to `Temporal.PlainTime`.
 *
 * Rejects a datetime, which `Temporal.PlainTime.from` would otherwise accept by
 * discarding the date half.
 */
export function fromISOTime(value: ISOTime | string): Temporal.PlainTime {
  if (/[T ]/.test(value)) {
    throw new RangeError(`Expected an ISO time (HH:MM or HH:MM:SS), got a datetime: ${value}`);
  }
  return Temporal.PlainTime.from(value);
}

/** {@link fromISOTime}, passing `undefined` through. */
export function fromISOTimeOrUndefined(value: ISOTime | string | null | undefined): Temporal.PlainTime | undefined {
  return value === null || value === undefined ? undefined : fromISOTime(value);
}

/** Parse an {@link ISOInstant} to `Temporal.Instant`. */
export function fromISOInstant(value: ISOInstant | string): Temporal.Instant {
  return Temporal.Instant.from(value);
}

/** {@link fromISOInstant}, passing `undefined` through. */
export function fromISOInstantOrUndefined(value: ISOInstant | string | null | undefined): Temporal.Instant | undefined {
  return value === null || value === undefined ? undefined : Temporal.Instant.from(value);
}

/**
 * A date range in Temporal terms.
 *
 * Structurally identical to each picker's internal `DateRangeValue`. Declared
 * here so the widening helpers below can live alongside their narrowing
 * counterparts without `date-time` importing from `components`.
 */
export type TemporalDateRange = {
  from: Temporal.PlainDate | undefined;
  to: Temporal.PlainDate | undefined;
};

/** An instant range in Temporal terms. */
export type TemporalInstantRange = {
  from: Temporal.Instant | undefined;
  to: Temporal.Instant | undefined;
};

/** Widen an {@link ISODateRange} for the internals. Inverse of {@link toISODateRange}. */
export function fromISODateRange(range: ISODateRange | undefined): TemporalDateRange | undefined {
  if (!range) return undefined;
  return { from: fromISODateOrUndefined(range.from), to: fromISODateOrUndefined(range.to) };
}

/** Widen an {@link ISOInstantRange} for the internals. Inverse of {@link toISOInstantRange}. */
export function fromISOInstantRange(range: ISOInstantRange | undefined): TemporalInstantRange | undefined {
  if (!range) return undefined;
  return { from: fromISOInstantOrUndefined(range.from), to: fromISOInstantOrUndefined(range.to) };
}

// =============================================================================
// Validation
// =============================================================================

/**
 * Whether `value` is a canonical-parseable ISO date, with no time component.
 *
 * Stricter than `isISODate` from `./validate`, which accepts a datetime because
 * `Temporal.PlainDate.from` does. Use this one at a boundary.
 */
export function isDateString(value: unknown): value is ISODate {
  if (typeof value !== "string" || /[T ]/.test(value)) return false;
  try {
    Temporal.PlainDate.from(value);
    return true;
  } catch {
    return false;
  }
}

/** Whether `value` is an ISO time, with no date component. */
export function isTimeString(value: unknown): value is ISOTime {
  if (typeof value !== "string" || /[T ]/.test(value)) return false;
  try {
    Temporal.PlainTime.from(value);
    return true;
  } catch {
    return false;
  }
}

/** Whether `value` is an ISO instant (any offset form; `Z` not required). */
export function isInstantString(value: unknown): value is ISOInstant {
  if (typeof value !== "string") return false;
  try {
    Temporal.Instant.from(value);
    return true;
  } catch {
    return false;
  }
}

// =============================================================================
// Comparison
// =============================================================================

/**
 * Compare two ISO strings of the same kind chronologically.
 *
 * Normalises first, so mixed input precision (`"10:30"` vs `"10:30:00"`) and
 * mixed instant offsets compare correctly — which raw `<` does not.
 *
 * @returns negative if `a` is earlier, 0 if equal, positive if `a` is later.
 */
export function compareISO(a: string, b: string): number {
  if (isDateString(a) && isDateString(b)) {
    return Temporal.PlainDate.compare(fromISODate(a), fromISODate(b));
  }
  if (isTimeString(a) && isTimeString(b)) {
    return Temporal.PlainTime.compare(fromISOTime(a), fromISOTime(b));
  }
  return Temporal.Instant.compare(fromISOInstant(a), fromISOInstant(b));
}

// =============================================================================
// ISO-native arithmetic
// =============================================================================
//
// Enough to build the `presets` and `disabled` values a consumer actually needs
// without reaching for Temporal. Anything more involved is what
// `@sixthshift/design-system/date-time` is for.
//
// `todayISO()` and `nowISO()` live in ./now alongside their Temporal siblings.

/** Shift a date by whole days. Negative moves backwards. */
export function addDaysISO(date: ISODate, days: number): ISODate {
  return fromISODate(date).add({ days }).toString() as ISODate;
}

/** Shift a date by whole months, clamping the day to the target month's length. */
export function addMonthsISO(date: ISODate, months: number): ISODate {
  return fromISODate(date).add({ months }).toString() as ISODate;
}

/** The first day of `date`'s month. */
export function startOfMonthISO(date: ISODate): ISODate {
  return fromISODate(date).with({ day: 1 }).toString() as ISODate;
}

/** The last day of `date`'s month. */
export function endOfMonthISO(date: ISODate): ISODate {
  const plain = fromISODate(date);
  return plain.with({ day: plain.daysInMonth }).toString() as ISODate;
}

/** The first day of `date`'s week. `weekStartsOn` counts from 0 = Sunday. */
export function startOfWeekISO(date: ISODate, weekStartsOn: WeekStartsOn = 0): ISODate {
  const plain = fromISODate(date);
  // Temporal's dayOfWeek is 1 = Monday..7 = Sunday; shift into 0 = Sunday..6.
  const currentDay = plain.dayOfWeek % 7;
  const diff = (currentDay - weekStartsOn + 7) % 7;
  return plain.subtract({ days: diff }).toString() as ISODate;
}

/** The last day of `date`'s week. `weekStartsOn` counts from 0 = Sunday. */
export function endOfWeekISO(date: ISODate, weekStartsOn: WeekStartsOn = 0): ISODate {
  return addDaysISO(startOfWeekISO(date, weekStartsOn), 6);
}

/**
 * Shift an instant by whole minutes. Negative moves backwards.
 *
 * Instant arithmetic, unlike the date helpers above, is exact — there are no
 * calendar boundaries to clamp against.
 */
export function addMinutesISO(instant: ISOInstant, minutes: number): ISOInstant {
  return fromISOInstant(instant).add({ minutes }).toString() as ISOInstant;
}

/** Shift an instant by whole hours. Negative moves backwards. */
export function addHoursISO(instant: ISOInstant, hours: number): ISOInstant {
  return fromISOInstant(instant).add({ hours }).toString() as ISOInstant;
}

/** The first day of `date`'s year. */
export function startOfYearISO(date: ISODate): ISODate {
  return fromISODate(date).with({ month: 1, day: 1 }).toString() as ISODate;
}

/** The last day of `date`'s year. */
export function endOfYearISO(date: ISODate): ISODate {
  return fromISODate(date).with({ month: 12, day: 31 }).toString() as ISODate;
}

/** ISO-8601 day numbers to {@link Weekday} names. Index 0 is unused; 1 = Monday. */
const WEEKDAY_NAME: readonly Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

/**
 * Which day of the week a date falls on, by name.
 *
 * The reason a consumer can filter dates without reaching for Temporal — see
 * {@link isWeekendISO} for the common case.
 *
 * @example
 * presets.filter((date) => weekdayISO(date) !== "sun")
 */
export function weekdayISO(date: ISODate): Weekday {
  // Temporal's dayOfWeek is 1 = Monday..7 = Sunday.
  return WEEKDAY_NAME[fromISODate(date).dayOfWeek - 1] as Weekday;
}

/** Whether a date falls on a Saturday or Sunday. */
export function isWeekendISO(date: ISODate): boolean {
  const day = weekdayISO(date);
  return day === "sat" || day === "sun";
}

// =============================================================================
// Disabled-date adaptation
// =============================================================================

/**
 * Convert one public {@link DisabledDates} matcher into the Temporal-shaped
 * matcher the calendar internals evaluate.
 *
 * `dayOfWeek` has no declarative Temporal equivalent, so it becomes a predicate.
 */
/**
 * Narrow the array form out of {@link DisabledDates}.
 *
 * `Array.isArray` narrows to `any[]`, which does not remove a `readonly T[]`
 * member from a union — so the object branches below would still see it.
 */
function isDateList(matcher: DisabledDates): matcher is readonly ISODate[] {
  return Array.isArray(matcher);
}

function adaptMatcher(matcher: DisabledDates): TemporalDisabledMatcher {
  if (typeof matcher === "string") return fromISODate(matcher);

  if (isDateList(matcher)) return matcher.map((date) => fromISODate(date));

  if (typeof matcher === "function") {
    return (date: Temporal.PlainDate) => matcher(date.toString() as ISODate);
  }

  if ("dayOfWeek" in matcher) {
    const wanted = new Set(matcher.dayOfWeek.map((day) => WEEKDAY_NUMBER[day]));
    return (date: Temporal.PlainDate) => wanted.has(date.dayOfWeek);
  }

  if ("before" in matcher) return { before: fromISODate(matcher.before) };
  if ("after" in matcher) return { after: fromISODate(matcher.after) };
  return { from: fromISODate(matcher.from), to: fromISODate(matcher.to) };
}

/**
 * The Temporal-shaped matcher union consumed by `calendar.hooks`.
 *
 * Declared here rather than imported to keep `date-time` free of component
 * imports; `calendar.types` re-exports it under its historical name.
 */
export type TemporalDisabledMatcher =
  | Temporal.PlainDate
  | Temporal.PlainDate[]
  | ((date: Temporal.PlainDate) => boolean)
  | { before: Temporal.PlainDate }
  | { after: Temporal.PlainDate }
  | { from: Temporal.PlainDate; to: Temporal.PlainDate };

/**
 * Convert the public `disabled` prop into internal matchers.
 *
 * Call this once per render behind a `useMemo` keyed on the prop — the result
 * holds Temporal objects, which have no value identity, so recomputing it every
 * render would invalidate every downstream `useCallback`.
 */
export function adaptDisabledDates(disabled: DisabledDates | DisabledDates[] | undefined): TemporalDisabledMatcher | TemporalDisabledMatcher[] | undefined {
  if (disabled === undefined) return undefined;

  // A bare `ISODate[]` is itself one matcher, not a list of them. An array of
  // anything else is a list. `["2026-08-26"]` is therefore adapted as a single
  // array-matcher, which evaluates identically either way.
  if (Array.isArray(disabled)) {
    if (disabled.every((entry) => typeof entry === "string")) {
      return adaptMatcher(disabled as ISODate[]);
    }
    return (disabled as DisabledDates[]).map(adaptMatcher);
  }

  return adaptMatcher(disabled);
}
