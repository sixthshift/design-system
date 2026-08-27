/**
 * CalendarView — the Temporal-typed calendar grid.
 *
 * Internal. Not reachable through the package's `exports` map: `./calendar`
 * resolves to this directory's `index.ts`, which deliberately does not re-export
 * it. Every picker composes this directly so that values cross the ISO boundary
 * exactly once, at the picker's own edge, rather than being serialised and
 * re-parsed on the way down to the grid.
 *
 * The public, ISO-typed `Calendar` is a thin wrapper in ./Calendar.tsx.
 */

import { cn } from "@sixthshift/design-system/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  addDays,
  addMonths,
  endOfWeek,
  formatMonthYear,
  isPlainDate,
  isSameMonth,
  parseDate,
  startOfMonth,
  startOfWeek,
  type Temporal,
  today,
} from "../../date-time";
import { Button } from "../Button";
import { Separator } from "../Separator";
import {
  defaultFormatDisplay,
  getDateSelectionState,
  isBeforeTemporal,
  isDateDisabled,
  isSameDateTemporal,
  temporalToISO,
  useCalendarDays,
} from "./calendar.hooks";
import type { CalendarViewProps, DateRangeValue, DisabledDateMatcher, PresetOption, RangePosition } from "./calendar.types";

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

function getDayLabels(weekStartsOn: number): string[] {
  return [...DAY_LABELS.slice(weekStartsOn), ...DAY_LABELS.slice(0, weekStartsOn)];
}

function getRangePositionClasses(rangePosition: RangePosition, isSelected: boolean): string {
  if (!isSelected) return "";

  switch (rangePosition) {
    case "start":
      return "rounded-l-full rounded-r-none bg-bg-brand text-fg-on-brand";
    case "end":
      return "rounded-r-full rounded-l-none bg-bg-brand text-fg-on-brand";
    case "middle":
      return "rounded-none bg-bg-brand-subtle text-fg-normal";
    case "single":
      return "bg-bg-brand text-fg-on-brand";
    default:
      return "";
  }
}

export const CalendarView = React.forwardRef<HTMLDivElement, CalendarViewProps>((props, ref) => {
  const {
    mode,
    month,
    onMonthChange,
    minDate,
    maxDate,
    disabled,
    weekStartsOn = 0,
    autoFocusDay = false,
    showFooter = false,
    showToday = true,
    onApply,
    onCancel,
    className,
  } = props;

  // Get mode-specific props
  const value = "value" in props ? props.value : undefined;
  const onSelect = "onSelect" in props ? props.onSelect : undefined;
  const presets = "presets" in props ? props.presets : undefined;
  const max = mode === "multiple" && "max" in props ? props.max : undefined;

  // Selection handler
  const handleSelect = useCallback(
    (temporalDate: Temporal.PlainDate) => {
      if (!onSelect) return;

      if (mode === "single") {
        const currentValue = value as Temporal.PlainDate | undefined;
        if (currentValue && isSameDateTemporal(temporalDate, currentValue)) {
          (onSelect as (date: Temporal.PlainDate | undefined) => void)(undefined);
        } else {
          (onSelect as (date: Temporal.PlainDate | undefined) => void)(temporalDate);
        }
        return;
      }

      if (mode === "multiple") {
        const currentValue = (value as Temporal.PlainDate[]) || [];
        const existingIndex = currentValue.findIndex((d) => isSameDateTemporal(temporalDate, d));

        if (existingIndex >= 0) {
          (onSelect as (dates: Temporal.PlainDate[]) => void)(currentValue.filter((_, i) => i !== existingIndex));
        } else if (!max || currentValue.length < max) {
          (onSelect as (dates: Temporal.PlainDate[]) => void)([...currentValue, temporalDate]);
        }
        return;
      }

      // Range mode
      const currentRange = (value as DateRangeValue) || {
        from: undefined,
        to: undefined,
      };

      if (!currentRange.from) {
        (onSelect as (range: DateRangeValue | undefined) => void)({ from: temporalDate, to: undefined });
        return;
      }

      if (!currentRange.to) {
        if (isBeforeTemporal(temporalDate, currentRange.from)) {
          (onSelect as (range: DateRangeValue | undefined) => void)({ from: temporalDate, to: currentRange.from });
        } else {
          (onSelect as (range: DateRangeValue | undefined) => void)({ from: currentRange.from, to: temporalDate });
        }
        return;
      }

      (onSelect as (range: DateRangeValue | undefined) => void)({ from: temporalDate, to: undefined });
    },
    [mode, value, onSelect, max]
  );

  // Today button
  const handleToday = useCallback(() => {
    if (!onSelect) return;

    const todayDate = today();
    if (mode === "single") {
      (onSelect as (date: Temporal.PlainDate | undefined) => void)(todayDate);
    } else if (mode === "multiple") {
      const current = (value as Temporal.PlainDate[]) || [];
      if (!current.some((d) => isSameDateTemporal(d, todayDate))) {
        if (!max || current.length < max) {
          (onSelect as (dates: Temporal.PlainDate[]) => void)([...current, todayDate]);
        }
      }
    }
    onMonthChange(todayDate);
  }, [mode, value, onSelect, max, onMonthChange]);

  // Preset selection
  const handlePresetClick = useCallback(
    (preset: PresetOption<unknown>) => {
      if (!onSelect) return;

      if (mode === "single" && isPlainDate(preset.value)) {
        (onSelect as (date: Temporal.PlainDate | undefined) => void)(preset.value);
      } else if (mode === "range" && typeof preset.value === "object" && preset.value !== null && "from" in preset.value) {
        (onSelect as (range: DateRangeValue | undefined) => void)(preset.value as DateRangeValue);
      } else if (mode === "multiple" && Array.isArray(preset.value)) {
        (onSelect as (dates: Temporal.PlainDate[]) => void)(preset.value as Temporal.PlainDate[]);
      }
    },
    [mode, onSelect]
  );

  // Calendar navigation
  const handlePrevMonth = () => onMonthChange(addMonths(month, -1));
  const handleNextMonth = () => onMonthChange(addMonths(month, 1));

  const days = useCalendarDays(month, weekStartsOn as 0 | 1 | 2 | 3 | 4 | 5 | 6);
  const dayLabels = getDayLabels(weekStartsOn);

  const handleDayClick = (date: Temporal.PlainDate) => {
    if (!isDateDisabled(date, disabled, minDate, maxDate)) {
      handleSelect(date);
    }
  };

  // ---------------------------------------------------------------------------
  // Roving focus
  //
  // A grid is a single tab stop: exactly one cell carries tabIndex={0} and the
  // arrow keys move between cells. `focusedDate` is null until the user actually
  // navigates, so we never steal focus on mount.
  // ---------------------------------------------------------------------------
  const [focusedDate, setFocusedDate] = useState<Temporal.PlainDate | null>(null);
  const gridRef = useRef<HTMLTableElement>(null);

  const firstSelected = useMemo((): Temporal.PlainDate | undefined => {
    if (mode === "single") return isPlainDate(value) ? value : undefined;
    if (mode === "multiple") return (value as Temporal.PlainDate[] | undefined)?.[0];
    return (value as DateRangeValue | undefined)?.from;
  }, [mode, value]);

  const activeDate = useMemo(() => {
    const isUsable = (date: Temporal.PlainDate) =>
      isSameMonth(date, month) && !isDateDisabled(date, disabled as DisabledDateMatcher | DisabledDateMatcher[] | undefined, minDate, maxDate);

    // Prefer where the user last was, then their selection, then today.
    for (const candidate of [focusedDate, firstSelected, today()]) {
      if (candidate && isUsable(candidate)) return candidate;
    }
    // Otherwise the first day of the month that can actually take focus, so the
    // grid never ends up with zero tab stops.
    const first = startOfMonth(month);
    for (let i = 0; i < first.daysInMonth; i++) {
      const candidate = addDays(first, i);
      if (isUsable(candidate)) return candidate;
    }
    return first;
  }, [focusedDate, firstSelected, month, disabled, minDate, maxDate]);

  const moveFocus = useCallback(
    (next: Temporal.PlainDate) => {
      setFocusedDate(next);
      if (!isSameMonth(next, month)) onMonthChange(next);
    },
    [month, onMonthChange]
  );

  const handleGridKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTableElement>) => {
      // Navigate from the cell that actually has focus, not from the derived
      // tab stop — otherwise focusing a day without selecting it would make the
      // arrow keys jump back to today.
      const focusedIso = (event.target as HTMLElement | null)?.closest?.("[data-date]")?.getAttribute("data-date");
      const origin = focusedIso ? parseDate(focusedIso) : activeDate;

      const dayStep: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
      const step = dayStep[event.key];

      if (step !== undefined) {
        event.preventDefault();
        moveFocus(addDays(origin, step));
        return;
      }

      switch (event.key) {
        case "Home":
          event.preventDefault();
          moveFocus(startOfWeek(origin, weekStartsOn));
          break;
        case "End":
          event.preventDefault();
          moveFocus(endOfWeek(origin, weekStartsOn));
          break;
        case "PageUp":
          event.preventDefault();
          moveFocus(addMonths(origin, -1));
          break;
        case "PageDown":
          event.preventDefault();
          moveFocus(addMonths(origin, 1));
          break;
        default:
          break;
      }
    },
    [activeDate, moveFocus, weekStartsOn]
  );

  // Follow the roving tabIndex with real DOM focus, but only once the user has
  // started navigating.
  useEffect(() => {
    if (!focusedDate) return;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${temporalToISO(focusedDate)}"]`)?.focus();
  }, [focusedDate]);

  // Seed that focus once when the caller asked for it. Deliberately keyed on
  // `autoFocusDay` alone: `activeDate` changes as the user navigates, and
  // re-running then would drag focus back to where it started.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above
  useEffect(() => {
    if (autoFocusDay) setFocusedDate((current) => current ?? activeDate);
  }, [autoFocusDay]);

  // useCalendarDays always returns 42 days, so this is always 6 rows of 7.
  const weeks = useMemo(() => {
    const chunked: (typeof days)[] = [];
    for (let i = 0; i < days.length; i += 7) chunked.push(days.slice(i, i + 7));
    return chunked;
  }, [days]);

  // Check if a preset is currently active
  const isPresetActive = useCallback(
    (preset: PresetOption<unknown>): boolean => {
      if (mode === "single" && isPlainDate(preset.value)) {
        return isPlainDate(value) && isSameDateTemporal(value, preset.value);
      }
      if (mode === "range" && typeof preset.value === "object" && preset.value !== null && "from" in preset.value) {
        const draft = value as DateRangeValue | undefined;
        const presetVal = preset.value as DateRangeValue;
        const fromMatch = (!draft?.from && !presetVal.from) || (draft?.from && presetVal.from && isSameDateTemporal(draft.from, presetVal.from));
        const toMatch = (!draft?.to && !presetVal.to) || (draft?.to && presetVal.to && isSameDateTemporal(draft.to, presetVal.to));
        return Boolean(fromMatch && toMatch);
      }
      if (mode === "multiple" && Array.isArray(preset.value)) {
        const draft = (value as Temporal.PlainDate[]) || [];
        const presetVal = preset.value as Temporal.PlainDate[];
        return draft.length === presetVal.length && draft.every((d) => presetVal.some((p) => isSameDateTemporal(d, p)));
      }
      return false;
    },
    [mode, value]
  );

  return (
    <div ref={ref} className={cn("flex", className)}>
      {/* Presets Sidebar */}
      {presets && presets.length > 0 && (
        <div className="mr-3 flex flex-col gap-1 border-border-normal border-r pr-3">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handlePresetClick(preset)}
              className={cn(
                `rounded-md px-3 py-1.5 text-left text-sm transition-colors`,
                `hover:bg-bg-subtle focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-inset`,
                isPresetActive(preset) && "bg-bg-brand-subtle text-fg-brand"
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {/* Calendar */}
      <div className="flex flex-col gap-3">
        {/* Header with navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="rounded-lg p-2 text-fg-subtle hover:bg-bg-subtle hover:text-fg-normal focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-focus-ring"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <span className="font-semibold text-sm">{formatMonthYear(month)}</span>

          <button
            type="button"
            onClick={handleNextMonth}
            className="rounded-lg p-2 text-fg-subtle hover:bg-bg-subtle hover:text-fg-normal focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-focus-ring"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Day grid — the ARIA grid pattern on real table semantics, so <tr>/<th>/<td>
            supply row/columnheader/gridcell roles implicitly. One tab stop, arrow-key
            navigation, and aria-selected on the cell (where it is valid) rather than
            on the button (where it is not). */}
        {/* biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: the ARIA grid
            pattern is defined on <table>; a date picker is an interactive composite widget,
            not a static table. Unlike the suppression this replaced, nothing here is being
            hidden — the axe checks in the story tests verify the resulting ARIA for real. */}
        <table ref={gridRef} role="grid" aria-label={formatMonthYear(month)} className="border-separate border-spacing-1" onKeyDown={handleGridKeyDown}>
          <thead>
            <tr>
              {dayLabels.map((label) => (
                <th key={label} scope="col" className="h-10 w-10 font-medium text-fg-subtle text-sm">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => (
              <tr key={temporalToISO(week[0]!.date)}>
                {week.map((day) => {
                  const isDisabledDay = isDateDisabled(day.date, disabled as DisabledDateMatcher | DisabledDateMatcher[] | undefined, minDate, maxDate);
                  const selectionState = getDateSelectionState(day.date, mode, value);

                  if (!day.isCurrentMonth) {
                    return <td key={temporalToISO(day.date)} className="h-10 w-10" />;
                  }

                  return (
                    // Biome resolves <td> to role "cell" because it does not track the
                    // ancestor role="grid", under which a <td> is a gridcell and
                    // aria-selected is valid. axe, which does track it, passes.
                    // biome-ignore lint/a11y/useAriaPropsSupportedByRole: <td> in a grid is a gridcell
                    <td key={temporalToISO(day.date)} aria-selected={selectionState.isSelected} className="p-0">
                      <button
                        type="button"
                        data-date={temporalToISO(day.date)}
                        onClick={() => handleDayClick(day.date)}
                        disabled={isDisabledDay}
                        tabIndex={isSameDateTemporal(day.date, activeDate) ? 0 : -1}
                        className={cn(
                          `flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-sm transition-colors`,
                          `hover:bg-bg-brand-strong hover:text-fg-on-brand-strong focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-inset`,
                          day.isToday && !selectionState.isSelected && "font-medium ring-1 ring-border-normal ring-inset",
                          isDisabledDay && "cursor-not-allowed opacity-50",
                          getRangePositionClasses(selectionState.rangePosition, selectionState.isSelected)
                        )}
                        aria-label={defaultFormatDisplay(day.date)}
                      >
                        {day.date.day}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        {showFooter && (
          <>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                {showToday && mode !== "range" && (
                  <Button type="button" variant="ghost" size="sm" onClick={handleToday}>
                    Today
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                {onCancel && (
                  <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                    Cancel
                  </Button>
                )}
                {onApply && (
                  <Button type="button" variant="solid" intent="brand" size="sm" onClick={onApply}>
                    Apply
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
});
CalendarView.displayName = "CalendarView";
