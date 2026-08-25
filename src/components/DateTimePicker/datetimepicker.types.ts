import type { Temporal, WeekStartsOn } from "../../temporal";

export type DisabledDateMatcher =
  | Temporal.PlainDate
  | Temporal.PlainDate[]
  | ((date: Temporal.PlainDate) => boolean)
  | { before: Temporal.PlainDate }
  | { after: Temporal.PlainDate }
  | { from: Temporal.PlainDate; to: Temporal.PlainDate };

export type DateTimePickerProps = {
  // Value (controlled/uncontrolled) - NOW USES INSTANT
  value?: Temporal.Instant | undefined;
  defaultValue?: Temporal.Instant | undefined;
  onChange?: (instant: Temporal.Instant | undefined) => void;

  // Date constraints
  minDate?: Temporal.PlainDate;
  maxDate?: Temporal.PlainDate;
  disabledDates?: DisabledDateMatcher | DisabledDateMatcher[];

  // Time constraints
  minTime?: Temporal.PlainTime;
  maxTime?: Temporal.PlainTime;
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
