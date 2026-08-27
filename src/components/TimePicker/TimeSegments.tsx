import type { Temporal } from "../../date-time";
import { SegmentedField, type SegmentSpec, type SegmentValues } from "../../internal";
import { parsedToTemporal, temporalTimeToISO, to12Hour, to24Hour } from "./timepicker.hooks";
import type { ClockFormat, TimeFormat } from "./timepicker.types";

export type TimeSegmentsProps = {
  /** The time the segments display. `undefined` leaves them empty. */
  value: Temporal.PlainTime | undefined;
  /**
   * Fires with a complete time, or `undefined` the moment the segments stop
   * describing one. Never fires a partial time.
   */
  onChange: (time: Temporal.PlainTime | undefined) => void;
  /** `"HH:mm:ss"` adds a seconds segment. */
  format?: TimeFormat | undefined;
  /** `"12h"` runs the hour 1–12 and adds an AM/PM segment. */
  clockFormat?: ClockFormat | undefined;
  isDisabled?: boolean | undefined;
  isInvalid?: boolean | undefined;
  label?: string | undefined;
  onOpenRequest?: (() => void) | undefined;
  onSubmit?: (() => void) | undefined;
  id?: string | undefined;
  className?: string | undefined;
};

const PERIODS = ["AM", "PM"];

/**
 * The segments for a clock, which depend on both format props: the hour's range
 * is the difference between a 12-hour and a 24-hour clock, and AM/PM only exists
 * in the former.
 */
export function timeSpec(format: TimeFormat, clockFormat: ClockFormat, leadingSeparator?: string): SegmentSpec[] {
  const twelve = clockFormat === "12h";
  const spec: SegmentSpec[] = [
    { name: "hour", label: "Hour", placeholder: "hh", digits: 2, min: twelve ? 1 : 0, max: twelve ? 12 : 23, separatorBefore: leadingSeparator },
    { name: "minute", label: "Minute", placeholder: "mm", digits: 2, min: 0, max: 59, separatorBefore: ":" },
  ];
  if (format === "HH:mm:ss") {
    spec.push({ name: "second", label: "Second", placeholder: "ss", digits: 2, min: 0, max: 59, separatorBefore: ":" });
  }
  if (twelve) {
    // A choice segment rather than a number: `a` and `p` type it, arrows toggle
    // it, and it announces "AM" instead of an index.
    spec.push({ kind: "choice", name: "period", label: "AM/PM", placeholder: "--", options: PERIODS, separatorBefore: " " });
  }
  return spec;
}

export function timeCodec(format: TimeFormat, clockFormat: ClockFormat) {
  const twelve = clockFormat === "12h";
  const withSeconds = format === "HH:mm:ss";

  const toSegments = (time: Temporal.PlainTime | undefined): SegmentValues => {
    if (!time) {
      return {
        hour: null,
        minute: null,
        ...(withSeconds ? { second: null } : {}),
        ...(twelve ? { period: null } : {}),
      };
    }
    const { hour12, period } = to12Hour(time.hour);
    return {
      hour: twelve ? hour12 : time.hour,
      minute: time.minute,
      ...(withSeconds ? { second: time.second } : {}),
      ...(twelve ? { period: period === "PM" ? 1 : 0 } : {}),
    };
  };

  const fromSegments = (values: Record<string, number>): Temporal.PlainTime => {
    const hour = twelve ? to24Hour(values.hour!, values.period === 1 ? "PM" : "AM") : values.hour!;
    // Seconds are part of the value even when the field does not show them —
    // `onChange` always emits canonical `HH:MM:SS`.
    return parsedToTemporal({ hour, minute: values.minute!, second: withSeconds ? values.second! : 0 });
  };

  /**
   * A pasted time is read as `H:MM`, `H:MM:SS`, optionally followed by a
   * meridiem. The hour is interpreted in the field's own clock, so `9:30 PM`
   * pasted into a 24-hour field still lands on 21:30.
   */
  const parsePaste = (text: string): SegmentValues | null => {
    const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?$/i.exec(text.trim());
    if (!match) return null;
    const meridiem = match[4]?.toUpperCase();
    let hour = Number(match[1]);
    if (meridiem) hour = to24Hour(hour, meridiem === "PM" ? "PM" : "AM");
    if (hour > 23 || Number(match[2]) > 59) return null;
    const second = match[3] === undefined ? 0 : Number(match[3]);
    if (second > 59) return null;
    return toSegments(parsedToTemporal({ hour, minute: Number(match[2]), second }));
  };

  return { toSegments, fromSegments, parsePaste };
}

/**
 * The typeable half of `TimePicker`: a time as spinbutton segments.
 *
 * A thin spec over `SegmentedField`, which owns the keyboard model. What belongs
 * to clocks specifically lives here: the hour's range and the AM/PM segment,
 * both decided by `clockFormat`, and the fact that the value always carries
 * seconds even when the field does not show them.
 *
 * `minuteStep` deliberately does not constrain typing. It sets the popover
 * column's increment, but snapping a typed `:37` onto a 15-minute grid would
 * fight the keystrokes.
 *
 * Internal to `TimePicker`; not exported from `./index.ts`.
 */
export function TimeSegments({ value, onChange, format = "HH:mm", clockFormat = "12h", label = "Time", ...rest }: TimeSegmentsProps) {
  const spec = timeSpec(format, clockFormat);
  const { toSegments, fromSegments, parsePaste } = timeCodec(format, clockFormat);

  return (
    <SegmentedField<Temporal.PlainTime>
      spec={spec}
      value={value}
      toSegments={toSegments}
      fromSegments={fromSegments}
      keyOf={(time) => temporalTimeToISO(time, "HH:mm:ss")}
      onChange={onChange}
      parsePaste={parsePaste}
      label={label}
      {...rest}
    />
  );
}
