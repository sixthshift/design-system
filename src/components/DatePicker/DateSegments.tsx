import { type Temporal, today, toISODate } from "../../date-time";
import { SegmentedField, type SegmentSpec, type SegmentValues } from "../../internal";
import type { DateSegmentOrder } from "./datepicker.types";

type SegmentName = "day" | "month" | "year";

export type DateSegmentsProps = {
  /** The date the segments display. `undefined` leaves them empty. */
  value: Temporal.PlainDate | undefined;
  /**
   * Fires with a complete date, or `undefined` the moment the segments stop
   * describing one. Never fires a partial date.
   */
  onChange: (date: Temporal.PlainDate | undefined) => void;
  order?: DateSegmentOrder | undefined;
  isDisabled?: boolean | undefined;
  isInvalid?: boolean | undefined;
  /** Accessible name for the segment group. */
  label?: string | undefined;
  /** `Alt+ArrowDown` — the combobox convention for "open the popup". */
  onOpenRequest?: (() => void) | undefined;
  /** `Enter` — the caller decides whether that means commit, submit or nothing. */
  onSubmit?: (() => void) | undefined;
  id?: string | undefined;
  className?: string | undefined;
};

export const DATE_ORDERS: Record<DateSegmentOrder, SegmentName[]> = {
  mdy: ["month", "day", "year"],
  dmy: ["day", "month", "year"],
  ymd: ["year", "month", "day"],
};

const BASE: Record<SegmentName, Omit<Extract<SegmentSpec, { kind?: "numeric" }>, "separatorBefore" | "stepFrom">> = {
  day: { name: "day", label: "Day", placeholder: "dd", digits: 2, min: 1, max: 31 },
  month: { name: "month", label: "Month", placeholder: "mm", digits: 2, min: 1, max: 12 },
  year: { name: "year", label: "Year", placeholder: "yyyy", digits: 4, min: 1, max: 9999 },
};

/** Days in a (year, month). `day: 1` keeps `with` from constraining a stale day. */
const daysInMonth = (year: number, month: number) => today().with({ year, month, day: 1 }).daysInMonth;

export const dateToSegments = (date: Temporal.PlainDate | undefined): SegmentValues =>
  date ? { day: date.day, month: date.month, year: date.year } : { day: null, month: null, year: null };

/**
 * The day is clamped rather than rejected: typing `31` and then moving the month
 * to February is a normal editing path, and snapping to the 28th keeps the field
 * describing a date the user can see and correct. Nothing else can be out of
 * range — the segments cap themselves as they are typed.
 */
export const dateFromSegments = (values: Record<string, number>): Temporal.PlainDate => {
  const year = values.year!;
  const month = values.month!;
  return today().with({ year, month, day: Math.min(values.day!, daysInMonth(year, month)) });
};

/**
 * ISO is always accepted — it is unambiguous, and it is what the rest of the
 * library speaks. Anything else is read in the field's own segment order, which
 * is the only reading that cannot be wrong.
 */
export function parseDatePasteIn(order: DateSegmentOrder) {
  return (text: string): SegmentValues | null => {
    const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
    const parts = iso ? [iso[1]!, iso[2]!, iso[3]!] : text.split(/[/\-.\s]+/);
    const names = iso ? DATE_ORDERS.ymd : DATE_ORDERS[order];
    if (parts.length !== 3 || parts.some((part) => !/^\d+$/.test(part))) return null;

    const next: SegmentValues = { day: null, month: null, year: null };
    names.forEach((name, index) => {
      const numeric = Number(parts[index]);
      next[name] = numeric >= BASE[name].min && numeric <= BASE[name].max ? numeric : null;
    });
    return next;
  };
}

/**
 * The typeable half of `DatePicker`: a date as three spinbutton segments.
 *
 * A thin spec over `SegmentedField`, which owns the keyboard model — digits
 * rolling forward, separators, digit-aware `Backspace`, deferred `onChange`.
 * What belongs to dates specifically lives here: the segment order (never
 * inferred from the locale, because `08/09` is a different date under each),
 * clamping the day to the month, and accepting a pasted ISO date.
 *
 * Internal to `DatePicker`; not exported from `./index.ts`.
 */
/**
 * The three date segments in the given order.
 *
 * Exported because `DateTimePicker` builds one field out of these plus the time
 * segments, rather than two fields glued together.
 */
export function dateSpec(order: DateSegmentOrder): SegmentSpec[] {
  const separator = order === "ymd" ? "-" : "/";
  const current = dateToSegments(today());

  return DATE_ORDERS[order].map((name, index) => ({
    ...BASE[name],
    // An arrow key on an empty segment starts from today, not from 1: the year
    // is the segment most likely to already be right.
    stepFrom: current[name] ?? BASE[name].min,
    separatorBefore: index > 0 ? separator : undefined,
  }));
}

export function DateSegments({ value, onChange, order = "mdy", label = "Date", ...rest }: DateSegmentsProps) {
  const spec = dateSpec(order);

  return (
    <SegmentedField<Temporal.PlainDate>
      spec={spec}
      value={value}
      toSegments={dateToSegments}
      fromSegments={dateFromSegments}
      keyOf={toISODate}
      onChange={onChange}
      parsePaste={parseDatePasteIn(order)}
      label={label}
      {...rest}
    />
  );
}
