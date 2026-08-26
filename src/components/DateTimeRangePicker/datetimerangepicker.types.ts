/**
 * DateTimeRangePicker types.
 *
 * Both ends of the range are absolute instants, exchanged as canonical UTC ISO
 * strings (`"2026-08-26T00:30:00Z"`). Date and time constraints are plain dates
 * and wall-clock times, since they describe the picker's grid rather than an
 * absolute moment.
 */

import type { DisabledDates, ISODate, ISOInstantRange, ISOTime, WeekStartsOn } from "../../date-time";

/**
 * A datetime range.
 *
 * Alias of `ISOInstantRange`, kept under this name because it is the historical
 * public type for this component.
 */
export type DateTimeRangeValue = ISOInstantRange;

export type DateTimeRangePresetOption = {
  label: string;
  /** Called when the picker renders, so relative ranges stay current. */
  value: () => DateTimeRangeValue;
};

export type DateTimeRangePickerProps = {
  // Value (controlled/uncontrolled) - NOW USES INSTANT
  value?: DateTimeRangeValue | undefined;
  defaultValue?: DateTimeRangeValue | undefined;
  onChange?: (range: DateTimeRangeValue | undefined) => void;

  // Presets
  presets?: DateTimeRangePresetOption[];
  showPresets?: boolean; // Default: true

  // Date constraints
  minDate?: ISODate;
  maxDate?: ISODate;
  disabledDates?: DisabledDates | DisabledDates[];

  // Time constraints (apply to both start and end times)
  minTime?: ISOTime;
  maxTime?: ISOTime;
  minuteStep?: 1 | 5 | 10 | 15 | 30;

  // Time format
  clockFormat?: "12h" | "24h"; // Default: "12h"
  showSeconds?: boolean; // Default: false

  // Display
  placeholder?: string;
  weekStartsOn?: WeekStartsOn;

  // Form
  name?: string;

  // State
  isDisabled?: boolean;
  isInvalid?: boolean;

  // Style
  className?: string;
  align?: "start" | "end";

  /** Whether the clear button is shown when a value is present (default: true) */
  clearable?: boolean;
};
