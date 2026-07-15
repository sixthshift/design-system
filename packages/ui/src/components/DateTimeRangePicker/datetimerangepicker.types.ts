import type { Temporal } from "@sixthshift/temporal";

export type DisabledDateMatcher =
  | Temporal.PlainDate
  | Temporal.PlainDate[]
  | ((date: Temporal.PlainDate) => boolean)
  | { before: Temporal.PlainDate }
  | { after: Temporal.PlainDate }
  | { from: Temporal.PlainDate; to: Temporal.PlainDate };

export type DateTimeRangeValue = {
  from: Temporal.Instant | undefined;
  to: Temporal.Instant | undefined;
};

export type DateTimeRangePresetOption = {
  label: string;
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
  minDate?: Temporal.PlainDate;
  maxDate?: Temporal.PlainDate;
  disabledDates?: DisabledDateMatcher | DisabledDateMatcher[];

  // Time constraints (apply to both start and end times)
  minTime?: Temporal.PlainTime;
  maxTime?: Temporal.PlainTime;
  minuteStep?: 1 | 5 | 10 | 15 | 30;

  // Time format
  clockFormat?: "12h" | "24h"; // Default: "12h"
  showSeconds?: boolean; // Default: false

  // Display
  placeholder?: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;

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
