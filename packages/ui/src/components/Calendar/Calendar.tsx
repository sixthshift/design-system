import { addMonths, formatMonthYear, isPlainDate, type Temporal, today } from "@sixthshift/temporal";
import { cn } from "@sixthshift/ui/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback } from "react";
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
import type { CalendarProps, DateRangeValue, DisabledDateMatcher, PresetOption, RangePosition } from "./calendar.types";

export type { CalendarProps };

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

export const Calendar = (props: CalendarProps) => {
  const {
    mode,
    month,
    onMonthChange,
    minDate,
    maxDate,
    disabled,
    weekStartsOn = 0,
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
    <div className={cn("flex", className)}>
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

        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1">
          {dayLabels.map((label) => (
            <div key={label} className="flex h-10 w-10 items-center justify-center font-medium text-fg-subtle text-sm">
              {label}
            </div>
          ))}
        </div>

        {/* Day grid */}
        {/* biome-ignore lint/a11y/useSemanticElements: ARIA grid pattern is correct for interactive date picker grid */}
        <div className="grid grid-cols-7 gap-1" role="grid">
          {days.map((day) => {
            const isDisabledDay = isDateDisabled(day.date, disabled as DisabledDateMatcher | DisabledDateMatcher[] | undefined, minDate, maxDate);
            const selectionState = getDateSelectionState(day.date, mode, value);

            if (!day.isCurrentMonth) {
              return <div key={temporalToISO(day.date)} className="h-10 w-10" />;
            }

            return (
              // biome-ignore lint/a11y/useAriaPropsSupportedByRole: aria-selected is valid in ARIA grid pattern for interactive date cells
              <button
                key={temporalToISO(day.date)}
                type="button"
                data-date={temporalToISO(day.date)}
                onClick={() => handleDayClick(day.date)}
                disabled={isDisabledDay}
                tabIndex={day.isToday ? 0 : -1}
                className={cn(
                  `flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-sm transition-colors`,
                  `hover:bg-bg-brand-strong hover:text-fg-on-brand-strong focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-inset`,
                  day.isToday && !selectionState.isSelected && "font-medium ring-1 ring-border-normal ring-inset",
                  isDisabledDay && "cursor-not-allowed opacity-50",
                  getRangePositionClasses(selectionState.rangePosition, selectionState.isSelected)
                )}
                aria-selected={selectionState.isSelected}
                aria-disabled={isDisabledDay}
                aria-label={defaultFormatDisplay(day.date)}
              >
                {day.date.day}
              </button>
            );
          })}
        </div>

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
                  <Button type="button" variant="solid" size="sm" onClick={onApply}>
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
};
