import { useCallback } from "react";
import { formatDateMediumYear, isPlainDate, Temporal } from "../../temporal";
import type { DatePickerMode, DateRangeValue, DateSelectionState, DisabledDateMatcher } from "./datepicker.types";

// =============================================================================
// Date Comparison Utilities (using Temporal)
// =============================================================================

/**
 * Check if two PlainDates represent the same day
 */
export function isSameDateTemporal(a: Temporal.PlainDate, b: Temporal.PlainDate): boolean {
  return Temporal.PlainDate.compare(a, b) === 0;
}

/**
 * Check if date a is before date b
 */
export function isBeforeTemporal(a: Temporal.PlainDate, b: Temporal.PlainDate): boolean {
  return Temporal.PlainDate.compare(a, b) < 0;
}

/**
 * Check if date a is after date b
 */
export function isAfterTemporal(a: Temporal.PlainDate, b: Temporal.PlainDate): boolean {
  return Temporal.PlainDate.compare(a, b) > 0;
}

/**
 * Check if a date is between two dates (inclusive)
 */
export function isBetweenTemporal(date: Temporal.PlainDate, start: Temporal.PlainDate, end: Temporal.PlainDate): boolean {
  return !isBeforeTemporal(date, start) && !isAfterTemporal(date, end);
}

/**
 * Convert a Temporal.PlainDate to ISO string (for form submission)
 */
export function temporalToISO(temporal: Temporal.PlainDate): string {
  return temporal.toString();
}

// =============================================================================
// Disabled Date Checking
// =============================================================================

/**
 * Check if a date matches a single disabled matcher
 */
function matchesDisabledMatcher(date: Temporal.PlainDate, matcher: DisabledDateMatcher): boolean {
  // Single date (Temporal.PlainDate)
  if (isPlainDate(matcher)) {
    return isSameDateTemporal(date, matcher);
  }

  // Array of dates
  if (Array.isArray(matcher)) {
    return matcher.some((d) => isPlainDate(d) && isSameDateTemporal(date, d));
  }

  // Function
  if (typeof matcher === "function") {
    return matcher(date);
  }

  // Before constraint
  if ("before" in matcher && !("to" in matcher)) {
    return isBeforeTemporal(date, matcher.before);
  }

  // After constraint
  if ("after" in matcher) {
    return isAfterTemporal(date, matcher.after);
  }

  // Range constraint
  if ("from" in matcher && "to" in matcher) {
    return isBetweenTemporal(date, matcher.from, matcher.to);
  }

  return false;
}

/**
 * Check if a date is disabled based on matchers, minDate, and maxDate
 */
export function isDateDisabled(
  date: Temporal.PlainDate,
  disabled?: DisabledDateMatcher | DisabledDateMatcher[],
  minDate?: Temporal.PlainDate,
  maxDate?: Temporal.PlainDate
): boolean {
  // Check min/max bounds
  if (minDate && isBeforeTemporal(date, minDate)) {
    return true;
  }
  if (maxDate && isAfterTemporal(date, maxDate)) {
    return true;
  }

  // No disabled matchers
  if (!disabled) {
    return false;
  }

  // Single matcher
  if (!Array.isArray(disabled)) {
    return matchesDisabledMatcher(date, disabled);
  }

  // Array of matchers (any match = disabled)
  return disabled.some((matcher) => matchesDisabledMatcher(date, matcher));
}

/**
 * Hook for checking if dates are disabled
 */
export function useIsDateDisabled(disabled?: DisabledDateMatcher | DisabledDateMatcher[], minDate?: Temporal.PlainDate, maxDate?: Temporal.PlainDate) {
  return useCallback((date: Temporal.PlainDate) => isDateDisabled(date, disabled, minDate, maxDate), [disabled, minDate, maxDate]);
}

// =============================================================================
// Selection State
// =============================================================================

/**
 * Get the selection state for a date based on mode and current value
 */
export function getDateSelectionState(
  date: Temporal.PlainDate,
  mode: DatePickerMode,
  value: Temporal.PlainDate | DateRangeValue | Temporal.PlainDate[] | undefined
): DateSelectionState {
  // Default: not selected
  const notSelected: DateSelectionState = {
    isSelected: false,
    rangePosition: "none",
  };

  if (value === undefined) {
    return notSelected;
  }

  // Single mode
  if (mode === "single") {
    const singleValue = value as Temporal.PlainDate | undefined;
    if (!singleValue || !isPlainDate(singleValue)) return notSelected;
    return {
      isSelected: isSameDateTemporal(date, singleValue),
      rangePosition: "single",
    };
  }

  // Multiple mode
  if (mode === "multiple") {
    const multiValue = value as Temporal.PlainDate[];
    return {
      isSelected: multiValue.some((d) => isSameDateTemporal(date, d)),
      rangePosition: "single",
    };
  }

  // Range mode
  const rangeValue = value as DateRangeValue;
  const { from, to } = rangeValue;

  // No selection
  if (!from && !to) {
    return notSelected;
  }

  // Only from selected
  if (from && !to) {
    return {
      isSelected: isSameDateTemporal(date, from),
      rangePosition: "single",
    };
  }

  // Only to selected (shouldn't happen normally, but handle it)
  if (!from && to) {
    return {
      isSelected: isSameDateTemporal(date, to),
      rangePosition: "single",
    };
  }

  // Both from and to selected
  const isFrom = isSameDateTemporal(date, from!);
  const isTo = isSameDateTemporal(date, to!);
  const isBetween = isBetweenTemporal(date, from!, to!);

  if (!isBetween && !isFrom && !isTo) {
    return notSelected;
  }

  // Same day for from and to
  if (isFrom && isTo) {
    return { isSelected: true, rangePosition: "single" };
  }

  // Start of range
  if (isFrom) {
    return { isSelected: true, rangePosition: "start" };
  }

  // End of range
  if (isTo) {
    return { isSelected: true, rangePosition: "end" };
  }

  // Middle of range
  return { isSelected: true, rangePosition: "middle" };
}

/**
 * Hook for getting selection state
 */
export function useSelectionState(mode: DatePickerMode, value: Temporal.PlainDate | DateRangeValue | Temporal.PlainDate[] | undefined) {
  return useCallback((date: Temporal.PlainDate) => getDateSelectionState(date, mode, value), [mode, value]);
}

// =============================================================================
// Selection Handlers
// =============================================================================

/**
 * Create a selection handler based on mode
 */
export function createSelectionHandler(
  mode: DatePickerMode,
  value: Temporal.PlainDate | DateRangeValue | Temporal.PlainDate[] | undefined,
  onChange:
    | ((value: Temporal.PlainDate | undefined) => void)
    | ((value: DateRangeValue | undefined) => void)
    | ((value: Temporal.PlainDate[]) => void)
    | undefined,
  options?: {
    closeOnSelect?: boolean | undefined;
    onOpenChange?: ((open: boolean) => void) | undefined;
    max?: number | undefined; // For multiple mode
  }
): (date: Temporal.PlainDate) => void {
  return (date: Temporal.PlainDate) => {
    if (!onChange) return;

    if (mode === "single") {
      const singleOnChange = onChange as (value: Temporal.PlainDate | undefined) => void;
      // Toggle: if already selected, deselect
      const currentValue = value as Temporal.PlainDate | undefined;
      if (currentValue && isSameDateTemporal(date, currentValue)) {
        singleOnChange(undefined);
      } else {
        singleOnChange(date);
        // Close on select for single mode
        if (options?.closeOnSelect !== false) {
          options?.onOpenChange?.(false);
        }
      }
      return;
    }

    if (mode === "multiple") {
      const multiOnChange = onChange as (value: Temporal.PlainDate[]) => void;
      const currentValue = (value as Temporal.PlainDate[]) || [];
      const existingIndex = currentValue.findIndex((d) => isSameDateTemporal(date, d));

      if (existingIndex >= 0) {
        // Remove if already selected
        multiOnChange(currentValue.filter((_, i) => i !== existingIndex));
      } else {
        // Add if not at max
        if (!options?.max || currentValue.length < options.max) {
          multiOnChange([...currentValue, date]);
        }
      }
      return;
    }

    // Range mode
    const rangeOnChange = onChange as (value: DateRangeValue | undefined) => void;
    const currentRange = (value as DateRangeValue) || {
      from: undefined,
      to: undefined,
    };

    // If no from date, set it
    if (!currentRange.from) {
      rangeOnChange({ from: date, to: undefined });
      return;
    }

    // If from but no to, set to (or swap if before from)
    if (!currentRange.to) {
      if (isBeforeTemporal(date, currentRange.from)) {
        // Swap: new date becomes from, old from becomes to
        rangeOnChange({ from: date, to: currentRange.from });
      } else {
        rangeOnChange({ from: currentRange.from, to: date });
      }
      // Close on select for range mode when complete
      if (options?.closeOnSelect !== false) {
        options?.onOpenChange?.(false);
      }
      return;
    }

    // If both are set, start a new selection
    rangeOnChange({ from: date, to: undefined });
  };
}

// =============================================================================
// Display Formatting
// =============================================================================

/**
 * Default display format for a date (e.g., "Jan 15, 2025")
 */
export function defaultFormatDisplay(date: Temporal.PlainDate): string {
  return formatDateMediumYear(date);
}

/**
 * Format a range for display
 */
export function formatRangeDisplay(range: DateRangeValue | undefined, formatFn: (date: Temporal.PlainDate) => string = defaultFormatDisplay): string {
  if (!range?.from && !range?.to) {
    return "";
  }

  if (range.from && !range.to) {
    return `${formatFn(range.from)} – ...`;
  }

  if (!range.from && range.to) {
    return `... – ${formatFn(range.to)}`;
  }

  return `${formatFn(range.from!)} – ${formatFn(range.to!)}`;
}

/**
 * Format multiple dates for display
 */
export function formatMultipleDisplay(dates: Temporal.PlainDate[] | undefined, formatFn: (date: Temporal.PlainDate) => string = defaultFormatDisplay): string {
  if (!dates || dates.length === 0) {
    return "";
  }

  if (dates.length === 1) {
    return formatFn(dates[0]!);
  }

  if (dates.length <= 3) {
    return dates.map(formatFn).join(", ");
  }

  return `${dates.length} dates selected`;
}

/**
 * Get display value based on mode
 */
export function getDisplayValue(
  mode: DatePickerMode,
  value: Temporal.PlainDate | DateRangeValue | Temporal.PlainDate[] | undefined,
  formatFn: (date: Temporal.PlainDate) => string = defaultFormatDisplay
): string {
  if (mode === "single") {
    const singleValue = value as Temporal.PlainDate | undefined;
    return singleValue ? formatFn(singleValue) : "";
  }

  if (mode === "range") {
    return formatRangeDisplay(value as DateRangeValue | undefined, formatFn);
  }

  return formatMultipleDisplay(value as Temporal.PlainDate[] | undefined, formatFn);
}
