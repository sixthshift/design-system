/**
 * Calendar types.
 *
 * Two layers live here, and the distinction is the whole point:
 *
 * - **Public (`Calendar*`)** — ISO strings. This is what a consumer writes, and
 *   what `@sixthshift/design-system/calendar` exports.
 * - **Internal (`CalendarView*`)** — Temporal objects. This is what the grid and
 *   `calendar.hooks` work in, and what every picker composes directly.
 *
 * The `CalendarView*` types are not exported from `./index.ts`, so they are
 * unreachable through the package's `exports` map.
 */

import type { DisabledDates, ISODate, ISODateRange, Temporal, TemporalDisabledMatcher, WeekStartsOn } from "../../date-time";

/**
 * Selection mode
 */
export type SelectionMode = "single" | "range" | "multiple";

/**
 * Preset option (generic over value type)
 */
export type PresetOption<T> = {
  label: string;
  value: T;
};

// ============================================================================
// Public props — ISO strings
// ============================================================================

type CalendarBaseProps = {
  /** Month being displayed. Any date within the month; the day is ignored. */
  month: ISODate;
  /** Called when the displayed month should change. */
  onMonthChange: (month: ISODate) => void;

  /** Earliest selectable date, inclusive. */
  minDate?: ISODate | undefined;
  /** Latest selectable date, inclusive. */
  maxDate?: ISODate | undefined;
  /** Which dates to refuse. See {@link DisabledDates}. */
  disabled?: DisabledDates | DisabledDates[] | undefined;

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
  value: ISODate | undefined;
  onSelect: (date: ISODate | undefined) => void;
  presets?: PresetOption<ISODate>[] | undefined;
};

export type CalendarRangeProps = CalendarBaseProps & {
  mode: "range";
  value: ISODateRange | undefined;
  onSelect: (range: ISODateRange | undefined) => void;
  presets?: PresetOption<ISODateRange>[] | undefined;
};

export type CalendarMultipleProps = CalendarBaseProps & {
  mode: "multiple";
  value: ISODate[];
  onSelect: (dates: ISODate[]) => void;
  max?: number | undefined;
  presets?: PresetOption<ISODate[]>[] | undefined;
};

/**
 * Calendar props — discriminated union based on mode
 */
export type CalendarProps = CalendarSingleProps | CalendarRangeProps | CalendarMultipleProps;

// ============================================================================
// Internal props — Temporal
// ============================================================================

/**
 * Date range value in Temporal terms.
 *
 * The public equivalent is `ISODateRange` from `../../date-time`.
 */
export type DateRangeValue = {
  from: Temporal.PlainDate | undefined;
  to: Temporal.PlainDate | undefined;
};

/**
 * Disabled date matchers, Temporal-shaped.
 *
 * Produced from the public {@link DisabledDates} by `adaptDisabledDates`.
 */
export type DisabledDateMatcher = TemporalDisabledMatcher;

type CalendarViewBaseProps = {
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

export type CalendarViewSingleProps = CalendarViewBaseProps & {
  mode: "single";
  value: Temporal.PlainDate | undefined;
  onSelect: (date: Temporal.PlainDate | undefined) => void;
  presets?: PresetOption<Temporal.PlainDate>[] | undefined;
};

export type CalendarViewRangeProps = CalendarViewBaseProps & {
  mode: "range";
  value: DateRangeValue | undefined;
  onSelect: (range: DateRangeValue | undefined) => void;
  presets?: PresetOption<DateRangeValue>[] | undefined;
};

export type CalendarViewMultipleProps = CalendarViewBaseProps & {
  mode: "multiple";
  value: Temporal.PlainDate[];
  onSelect: (dates: Temporal.PlainDate[]) => void;
  max?: number | undefined;
  presets?: PresetOption<Temporal.PlainDate[]>[] | undefined;
};

/**
 * CalendarView props — discriminated union based on mode
 */
export type CalendarViewProps = CalendarViewSingleProps | CalendarViewRangeProps | CalendarViewMultipleProps;

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
