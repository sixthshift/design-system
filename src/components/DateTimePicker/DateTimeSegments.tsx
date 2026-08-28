"use client";

import { Temporal } from "../../date-time";
import { SegmentedField, type SegmentSpec, type SegmentValues } from "../../internal";
import { dateFromSegments, dateSpec, dateToSegments, parseDatePasteIn } from "../DatePicker/DateSegments";
import type { DateSegmentOrder } from "../DatePicker/datepicker.types";
import { timeCodec, timeSpec } from "../TimePicker/TimeSegments";
import type { ClockFormat } from "../TimePicker/timepicker.types";

export type DateTimeSegmentsProps = {
  /** The instant the segments display, or `undefined` for an empty field. */
  value: Temporal.Instant | undefined;
  /**
   * Fires with a complete instant, or `undefined` the moment the segments stop
   * describing one. Never fires a partial value.
   */
  onChange: (instant: Temporal.Instant | undefined) => void;
  /** The zone the segments are read and written in. */
  timeZone: string;
  order?: DateSegmentOrder | undefined;
  clockFormat?: ClockFormat | undefined;
  showSeconds?: boolean | undefined;
  isDisabled?: boolean | undefined;
  isInvalid?: boolean | undefined;
  label?: string | undefined;
  onOpenRequest?: (() => void) | undefined;
  onSubmit?: (() => void) | undefined;
  id?: string | undefined;
  className?: string | undefined;
};

/**
 * The typeable half of `DateTimePicker`: one field of date *and* time segments.
 *
 * Deliberately one `SegmentedField` rather than a date field beside a time
 * field: it is one value, so `Tab` and the digit roll-forward should carry
 * straight from the year into the hour. `152026330p` is January 5th 2026 at
 * 3:30pm, typed without a single tab.
 *
 * The date and time halves reuse the specs and codecs from `DatePicker` and
 * `TimePicker`, so the three fields cannot drift apart in behaviour. What is
 * specific here is the zone: segments are wall-clock, the value is an instant,
 * and this is where that conversion happens.
 *
 * Internal to `DateTimePicker`; not exported from `./index.ts`.
 */
export function DateTimeSegments({
  value,
  onChange,
  timeZone,
  order = "mdy",
  clockFormat = "12h",
  showSeconds = false,
  label = "Date and time",
  ...rest
}: DateTimeSegmentsProps) {
  const format = showSeconds ? "HH:mm:ss" : "HH:mm";
  // A space, not a slash: it separates the date from the time rather than one
  // number from the next.
  const spec: SegmentSpec[] = [...dateSpec(order), ...timeSpec(format, clockFormat, " ")];
  const time = timeCodec(format, clockFormat);

  const toSegments = (instant: Temporal.Instant | undefined): SegmentValues => {
    if (!instant) return { ...dateToSegments(undefined), ...time.toSegments(undefined) };
    const zoned = instant.toZonedDateTimeISO(timeZone);
    return { ...dateToSegments(zoned.toPlainDate()), ...time.toSegments(zoned.toPlainTime()) };
  };

  const fromSegments = (values: Record<string, number>): Temporal.Instant => {
    const date = dateFromSegments(values);
    const plainTime = time.fromSegments(values);
    return date.toPlainDateTime(plainTime).toZonedDateTime(timeZone).toInstant();
  };

  /**
   * A pasted string is split at the first space: the date half is read by the
   * date field's rules (ISO always, otherwise the segment order) and the time
   * half by the clock's. Either half alone is accepted, leaving the other empty.
   */
  const parsePaste = (text: string): SegmentValues | null => {
    const trimmed = text.trim();
    // An ISO instant pastes as a whole.
    try {
      if (/\d{4}-\d{2}-\d{2}T/.test(trimmed)) return toSegments(Temporal.Instant.from(trimmed));
    } catch {
      // Not an instant after all; fall through to the halves below.
    }

    const [datePart, ...timeParts] = trimmed.split(/\s+/);
    const datePasted = datePart ? parseDatePasteIn(order)(datePart) : null;
    const timePasted = timeParts.length > 0 ? time.parsePaste(timeParts.join(" ")) : null;
    if (!datePasted && !timePasted) return null;

    return {
      ...dateToSegments(undefined),
      ...time.toSegments(undefined),
      ...(datePasted ?? {}),
      ...(timePasted ?? {}),
    };
  };

  return (
    <SegmentedField<Temporal.Instant>
      spec={spec}
      value={value}
      toSegments={toSegments}
      fromSegments={fromSegments}
      keyOf={(instant) => instant.toString()}
      onChange={onChange}
      parsePaste={parsePaste}
      label={label}
      {...rest}
    />
  );
}
