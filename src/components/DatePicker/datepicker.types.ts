/**
 * DatePicker types.
 *
 * All date values at the public boundary are canonical ISO 8601 strings
 * (`"2026-08-26"`). Temporal is an implementation detail of the calendar grid;
 * the `*Internal` types below describe that layer and are not exported from
 * `./index.ts`.
 */

import type { DisabledDates, ISODate, ISODateRange, Temporal, TemporalDisabledMatcher, WeekStartsOn } from "../../date-time";
import type { PresetOption as CalendarPresetOption } from "../Calendar/calendar.types";

// =============================================================================
// Value Types
// =============================================================================

/**
 * Selection mode for the DatePicker
 */
export type DatePickerMode = "single" | "range" | "multiple";

/**
 * Which order the typeable segments read in.
 *
 * Explicit rather than inferred from the runtime locale: `08/09` is a different
 * date under `mdy` than under `dmy`, and a component that guesses is wrong for
 * half its users. Defaults to `mdy`, matching the `en-US` formatting the rest
 * of the library's display helpers use.
 */
export type DateSegmentOrder = "mdy" | "dmy" | "ymd";

// =============================================================================
// Internal (Temporal) types
// =============================================================================

/**
 * Date range value in Temporal terms, used by `datepicker.hooks`.
 *
 * The public equivalent is `ISODateRange`.
 */
export type DateRangeValue = {
  from: Temporal.PlainDate | undefined;
  to: Temporal.PlainDate | undefined;
};

/**
 * Temporal-shaped disabled matchers, produced from the public
 * {@link DisabledDates} by `adaptDisabledDates`.
 */
export type DisabledDateMatcher = TemporalDisabledMatcher;

// =============================================================================
// Props (discriminated union by mode)
// =============================================================================

type DatePickerBaseProps = {
  /** First day of week (0 = Sunday, 1 = Monday) */
  weekStartsOn?: WeekStartsOn;

  /** Earliest selectable date, inclusive */
  minDate?: ISODate;

  /** Latest selectable date, inclusive */
  maxDate?: ISODate;

  /** Which dates to refuse. See `DisabledDates`. */
  disabled?: DisabledDates | DisabledDates[];

  /**
   * Placeholder for the read-only text trigger, which only `multiple` mode
   * still uses. `single` and `range` are typeable fields whose segments show
   * their own placeholders (`mm/dd/yyyy`).
   */
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

  /**
   * Segment order for the typeable field (`single` mode only; default `mdy`).
   * See {@link DateSegmentOrder}.
   */
  segmentOrder?: DateSegmentOrder;
};

export type DatePickerSingleProps = DatePickerBaseProps & {
  mode?: "single";
  /** Controlled value */
  value?: ISODate | undefined;
  /** Default value for uncontrolled mode */
  defaultValue?: ISODate | undefined;
  /** Called when date changes */
  onChange?: (date: ISODate | undefined) => void;
  /** Preset options (shown in left sidebar) */
  presets?: CalendarPresetOption<ISODate>[];
};

export type DatePickerRangeProps = DatePickerBaseProps & {
  mode: "range";
  /** Controlled value */
  value?: ISODateRange | undefined;
  /** Default value for uncontrolled mode */
  defaultValue?: ISODateRange | undefined;
  /** Called when range changes */
  onChange?: (range: ISODateRange | undefined) => void;
  /** Preset options (shown in left sidebar) */
  presets?: CalendarPresetOption<ISODateRange>[];
};

export type DatePickerMultipleProps = DatePickerBaseProps & {
  mode: "multiple";
  /** Controlled value (array of dates) */
  value?: ISODate[] | undefined;
  /** Default value for uncontrolled mode */
  defaultValue?: ISODate[] | undefined;
  /** Called when selection changes */
  onChange?: (dates: ISODate[]) => void;
  /** Maximum number of dates that can be selected */
  max?: number | undefined;
  /** Preset options (shown in left sidebar) */
  presets?: CalendarPresetOption<ISODate[]>[];
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
