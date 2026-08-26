/**
 * DateRangePicker types.
 *
 * All values at the public boundary are canonical ISO 8601 date strings
 * (`"2026-08-26"`).
 */

import type { DisabledDates, ISODate, ISODateRange, WeekStartsOn } from "../../date-time";

/**
 * A preset range.
 *
 * The value is a function so that relative ranges ("Last 7 days") are computed
 * when the picker renders rather than when the preset list is defined.
 */
export type PresetOption = {
  label: string;
  value: () => ISODateRange;
};

export type DateRangePickerProps = {
  // Value (controlled/uncontrolled)
  value?: ISODateRange;
  defaultValue?: ISODateRange;
  onChange?: (range: ISODateRange | undefined) => void;

  // Constraints
  minDate?: ISODate;
  maxDate?: ISODate;
  disabled?: DisabledDates | DisabledDates[];

  // Presets
  presets?: PresetOption[];
  showPresets?: boolean; // Default: true

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
