/**
 * Calendar types for the generic date picker calendar component
 *
 * This component is used by DatePicker, DateTimePicker, and DateTimeRangePicker
 * for consistent date selection UI.
 */

import type { Temporal, WeekStartsOn } from "../../date-time";

/**
 * Date range value
 */
export type DateRangeValue = {
  from: Temporal.PlainDate | undefined;
  to: Temporal.PlainDate | undefined;
};

/**
 * Selection mode
 */
export type SelectionMode = "single" | "range" | "multiple";

/**
 * Disabled date matchers
 */
export type DisabledDateMatcher =
  | Temporal.PlainDate
  | Temporal.PlainDate[]
  | ((date: Temporal.PlainDate) => boolean)
  | { before: Temporal.PlainDate }
  | { after: Temporal.PlainDate }
  | { from: Temporal.PlainDate; to: Temporal.PlainDate };

/**
 * Preset option (generic over value type)
 */
export type PresetOption<T> = {
  label: string;
  value: T;
};

// ============================================================================
// Discriminated Union Props
// ============================================================================

type CalendarBaseProps = {
  /** Current month being displayed */
  month: Temporal.PlainDate;
  /** Called when month should change */
  onMonthChange: (month: Temporal.PlainDate) => void;

  /** Minimum selectable date */
  minDate?: Temporal.PlainDate | undefined;
  /** Maximum selectable date */
  maxDate?: Temporal.PlainDate | undefined;
  /** Disabled date matchers */
  disabled?: DisabledDateMatcher | DisabledDateMatcher[] | undefined;

  /** First day of week (0 = Sunday, 1 = Monday) */
  weekStartsOn?: WeekStartsOn | undefined;

  /** Show footer with Today/Cancel/Apply buttons */
  showFooter?: boolean | undefined;
  /** Show Today button (only if showFooter=true) */
  showToday?: boolean | undefined;
  /** Called when Apply is clicked */
  onApply?: (() => void) | undefined;
  /** Called when Cancel is clicked */
  onCancel?: (() => void) | undefined;

  /** Additional CSS class */
  className?: string | undefined;
};

export type CalendarSingleProps = CalendarBaseProps & {
  mode: "single";
  value: Temporal.PlainDate | undefined;
  onSelect: (date: Temporal.PlainDate | undefined) => void;
  presets?: PresetOption<Temporal.PlainDate>[] | undefined;
};

export type CalendarRangeProps = CalendarBaseProps & {
  mode: "range";
  value: DateRangeValue | undefined;
  onSelect: (range: DateRangeValue | undefined) => void;
  presets?: PresetOption<DateRangeValue>[] | undefined;
};

export type CalendarMultipleProps = CalendarBaseProps & {
  mode: "multiple";
  value: Temporal.PlainDate[];
  onSelect: (dates: Temporal.PlainDate[]) => void;
  max?: number | undefined;
  presets?: PresetOption<Temporal.PlainDate[]>[] | undefined;
};

/**
 * Calendar props - discriminated union based on mode
 */
export type CalendarProps = CalendarSingleProps | CalendarRangeProps | CalendarMultipleProps;

// ============================================================================
// Internal Types
// ============================================================================

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
