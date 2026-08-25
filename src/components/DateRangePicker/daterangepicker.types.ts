import type { Temporal } from "../../temporal";

export type DateRangeValue = {
  from: Temporal.PlainDate | undefined;
  to: Temporal.PlainDate | undefined;
};

export type PresetOption = {
  label: string;
  value: () => DateRangeValue;
};

export type DisabledDateMatcher =
  | Temporal.PlainDate
  | Temporal.PlainDate[]
  | ((date: Temporal.PlainDate) => boolean)
  | { before: Temporal.PlainDate }
  | { after: Temporal.PlainDate }
  | { from: Temporal.PlainDate; to: Temporal.PlainDate };

export type DateRangePickerProps = {
  // Value (controlled/uncontrolled)
  value?: DateRangeValue;
  defaultValue?: DateRangeValue;
  onChange?: (range: DateRangeValue | undefined) => void;

  // Constraints
  minDate?: Temporal.PlainDate;
  maxDate?: Temporal.PlainDate;
  disabled?: DisabledDateMatcher | DisabledDateMatcher[];

  // Presets
  presets?: PresetOption[];
  showPresets?: boolean; // Default: true

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
