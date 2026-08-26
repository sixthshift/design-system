/**
 * DateTimePicker types.
 *
 * The value is an absolute instant, exchanged as a canonical UTC ISO string
 * (`"2026-08-26T00:30:00Z"`). Input written with a numeric offset is accepted and
 * normalised to the `Z` form, so one instant always has one representation.
 *
 * Date and time constraints are plain dates and wall-clock times, since they
 * describe the picker's grid rather than an absolute moment.
 */

import type { DisabledDates, ISODate, ISOInstant, ISOTime, WeekStartsOn } from "../../date-time";

export type DateTimePickerProps = {
  // Value (controlled/uncontrolled) — an absolute instant, in UTC
  value?: ISOInstant | undefined;
  defaultValue?: ISOInstant | undefined;
  /** Called with a canonical UTC instant string, or undefined when cleared. */
  onChange?: (instant: ISOInstant | undefined) => void;

  // Date constraints
  minDate?: ISODate;
  maxDate?: ISODate;
  disabledDates?: DisabledDates | DisabledDates[];

  // Time constraints
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
