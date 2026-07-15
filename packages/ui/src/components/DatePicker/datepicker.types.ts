/**
 * DatePicker types
 *
 * All date values use Temporal.PlainDate at the component boundary.
 * This provides type safety and semantic clarity about what kind of date is expected.
 */

import type { Temporal } from "@sixthshift/temporal";
import type { PresetOption as CalendarPresetOption } from "../Calendar/calendar.types";

// =============================================================================
// Value Types
// =============================================================================

/**
 * Date range value for range mode
 */
export type DateRangeValue = {
  from: Temporal.PlainDate | undefined;
  to: Temporal.PlainDate | undefined;
};

/**
 * Selection mode for the DatePicker
 */
export type DatePickerMode = "single" | "range" | "multiple";

// =============================================================================
// Disabled Date Matching
// =============================================================================

/**
 * Matchers for disabling dates
 */
export type DisabledDateMatcher =
  | Temporal.PlainDate // Single date
  | Temporal.PlainDate[] // Array of dates
  | ((date: Temporal.PlainDate) => boolean) // Custom function
  | { before: Temporal.PlainDate } // All dates before
  | { after: Temporal.PlainDate } // All dates after
  | { from: Temporal.PlainDate; to: Temporal.PlainDate }; // Date range

// =============================================================================
// Props (discriminated union by mode)
// =============================================================================

type DatePickerBaseProps = {
  /** First day of week (0 = Sunday, 1 = Monday) */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;

  /** Minimum selectable date */
  minDate?: Temporal.PlainDate;

  /** Maximum selectable date */
  maxDate?: Temporal.PlainDate;

  /** Disabled dates */
  disabled?: DisabledDateMatcher | DisabledDateMatcher[];

  /** Placeholder text */
  placeholder?: string;

  /** Input name for form submission */
  name?: string;

  /** Whether the picker is disabled */
  isDisabled?: boolean;

  /** Error state */
  isInvalid?: boolean;

  /** Additional class name for the trigger input */
  className?: string;

  /** Horizontal alignment of the popup calendar */
  align?: "start" | "end";

  /** Whether the clear button is shown when a value is present (default: true) */
  clearable?: boolean;
};

export type DatePickerSingleProps = DatePickerBaseProps & {
  mode?: "single";
  /** Controlled value */
  value?: Temporal.PlainDate | undefined;
  /** Default value for uncontrolled mode */
  defaultValue?: Temporal.PlainDate | undefined;
  /** Called when date changes */
  onChange?: (date: Temporal.PlainDate | undefined) => void;
  /** Preset options (shown in left sidebar) */
  presets?: CalendarPresetOption<Temporal.PlainDate>[];
};

export type DatePickerRangeProps = DatePickerBaseProps & {
  mode: "range";
  /** Controlled value */
  value?: DateRangeValue | undefined;
  /** Default value for uncontrolled mode */
  defaultValue?: DateRangeValue | undefined;
  /** Called when range changes */
  onChange?: (range: DateRangeValue | undefined) => void;
  /** Preset options (shown in left sidebar) */
  presets?: CalendarPresetOption<DateRangeValue>[];
};

export type DatePickerMultipleProps = DatePickerBaseProps & {
  mode: "multiple";
  /** Controlled value (array of dates) */
  value?: Temporal.PlainDate[] | undefined;
  /** Default value for uncontrolled mode */
  defaultValue?: Temporal.PlainDate[] | undefined;
  /** Called when selection changes */
  onChange?: (dates: Temporal.PlainDate[]) => void;
  /** Maximum number of dates that can be selected */
  max?: number | undefined;
  /** Preset options (shown in left sidebar) */
  presets?: CalendarPresetOption<Temporal.PlainDate[]>[];
};

/**
 * DatePicker props - discriminated union based on mode
 */
export type DatePickerProps = DatePickerSingleProps | DatePickerRangeProps | DatePickerMultipleProps;

// =============================================================================
// Internal Types
// =============================================================================

/**
 * Position of a date within a range selection
 */
export type RangePosition = "start" | "middle" | "end" | "single" | "none";

/**
 * Selection state for a date cell
 */
export type DateSelectionState = {
  isSelected: boolean;
  rangePosition: RangePosition;
};
