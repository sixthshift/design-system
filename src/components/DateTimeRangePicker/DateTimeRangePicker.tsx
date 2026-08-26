import { autoUpdate, FloatingPortal, flip, offset, shift, useClick, useDismiss, useFloating, useInteractions } from "@floating-ui/react";
import { useControllableState } from "@sixthshift/design-system/hooks";
import { cn } from "@sixthshift/design-system/utils";
import { Calendar as CalendarIcon, X } from "lucide-react";
import * as React from "react";
import { useCallback, useId, useMemo, useState } from "react";
import {
  adaptDisabledDates,
  fromISODateOrUndefined,
  fromISOInstantRange,
  fromISOTimeOrUndefined,
  now,
  Temporal,
  type TemporalInstantRange,
  today,
  toISOInstant,
  toISOInstantRange,
} from "../../date-time";

import { Button } from "../Button";
import { CalendarView } from "../Calendar/CalendarView";
import type { DateRangeValue } from "../Calendar/calendar.types";
import { Separator } from "../Separator";
import { PeriodSelector } from "../TimePicker/PeriodSelector";
import { TimeColumn } from "../TimePicker/TimeColumn";
import {
  generateHours,
  generateMinutes,
  generateSeconds,
  getCurrentTime,
  isTimeDisabled,
  temporalToParsed,
  to12Hour,
  to24Hour,
} from "../TimePicker/timepicker.hooks";
import type { ParsedTime, TimePeriod } from "../TimePicker/timepicker.types";
import type { DateTimeRangePickerProps, DateTimeRangePresetOption, DateTimeRangeValue } from "./datetimerangepicker.types";

/**
 * Format an Instant for display
 */
function formatInstantDisplay(instant: Temporal.Instant, clockFormat: "12h" | "24h", showSeconds: boolean, timeZone?: string): string {
  const tz = timeZone ?? Temporal.Now.timeZoneId();
  const zoned = instant.toZonedDateTimeISO(tz);
  const plainDateTime = zoned.toPlainDateTime();

  // Format date part
  const datePart = plainDateTime.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Format time part based on props
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: clockFormat === "12h",
  };

  if (showSeconds) {
    timeOptions.second = "2-digit";
  }

  const timePart = plainDateTime.toLocaleString("en-US", timeOptions);

  return `${datePart}, ${timePart}`;
}

/**
 * Format an Instant range for display.
 *
 * Takes the internal Temporal range, not the public ISO shape — display runs
 * below the boundary.
 */
function formatRangeDisplay(range: TemporalInstantRange | undefined, clockFormat: "12h" | "24h", showSeconds: boolean): string {
  if (!range?.from && !range?.to) {
    return "";
  }

  if (range.from && !range.to) {
    return `${formatInstantDisplay(range.from, clockFormat, showSeconds)} – ...`;
  }

  if (!range.from && range.to) {
    return `... – ${formatInstantDisplay(range.to, clockFormat, showSeconds)}`;
  }

  return `${formatInstantDisplay(range.from!, clockFormat, showSeconds)} – ${formatInstantDisplay(range.to!, clockFormat, showSeconds)}`;
}

/**
 * Default preset ranges for DateTimeRangePicker
 *
 * Uses clean hour boundaries and returns canonical UTC instant strings
 */
function getDefaultPresets(): DateTimeRangePresetOption[] {
  return [
    {
      label: "Last hour",
      value: () => {
        const end = now().round({ smallestUnit: "hour", roundingMode: "ceil" });
        const start = end.subtract({ hours: 1 });
        return { from: toISOInstant(start), to: toISOInstant(end) };
      },
    },
    {
      label: "Last 24 hours",
      value: () => {
        const end = now().round({ smallestUnit: "hour", roundingMode: "ceil" });
        const start = end.subtract({ hours: 24 });
        return { from: toISOInstant(start), to: toISOInstant(end) };
      },
    },
    {
      label: "Last 7 days",
      value: () => {
        const end = now().round({ smallestUnit: "hour", roundingMode: "ceil" });
        const start = end.subtract({ hours: 7 * 24 });
        return { from: toISOInstant(start), to: toISOInstant(end) };
      },
    },
    {
      label: "Last 30 days",
      value: () => {
        const end = now().round({ smallestUnit: "hour", roundingMode: "ceil" });
        const start = end.subtract({ hours: 30 * 24 });
        return { from: toISOInstant(start), to: toISOInstant(end) };
      },
    },
    {
      label: "This month",
      value: () => {
        const end = now().round({ smallestUnit: "hour", roundingMode: "ceil" });
        const tz = Temporal.Now.timeZoneId();
        const zonedNow = end.toZonedDateTimeISO(tz);
        const startOfMonth = zonedNow.toPlainDate().with({ day: 1 }).toPlainDateTime(Temporal.PlainTime.from("00:00:00")).toZonedDateTime(tz).toInstant();
        return { from: toISOInstant(startOfMonth), to: toISOInstant(end) };
      },
    },
  ];
}

/**
 * DateTimeRangePicker - A component for selecting a datetime range
 *
 * Combines date range selection with separate time pickers for start and end times.
 * All values cross the boundary as canonical UTC instant strings.
 */
export const DateTimeRangePicker = React.forwardRef<HTMLDivElement, DateTimeRangePickerProps>((props, ref) => {
  const {
    value,
    defaultValue,
    onChange,
    presets: customPresets,
    showPresets = true,
    minDate,
    maxDate,
    disabledDates,
    minTime,
    maxTime,
    minuteStep = 1,
    clockFormat = "12h",
    showSeconds = false,
    placeholder = "Select datetime range...",
    weekStartsOn = 0,
    name,
    isDisabled = false,
    isInvalid = false,
    className,
    align = "end",
    clearable = true,
  } = props;

  // Open state
  const [open, setOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // The ISO boundary.
  //
  // Both ends of the range cross as canonical UTC instant strings; constraints
  // cross as ISO dates and times. Below this block everything is Temporal, as
  // before. Each conversion is memoised on its source value so the Temporal
  // objects handed downstream stay referentially stable.
  // ---------------------------------------------------------------------------

  const temporalValue = useMemo(() => fromISOInstantRange(value), [value]);
  const temporalDefaultValue = useMemo(() => fromISOInstantRange(defaultValue), [defaultValue]);
  const temporalMinDate = useMemo(() => fromISODateOrUndefined(minDate), [minDate]);
  const temporalMaxDate = useMemo(() => fromISODateOrUndefined(maxDate), [maxDate]);
  const temporalMinTime = useMemo(() => fromISOTimeOrUndefined(minTime), [minTime]);
  const temporalMaxTime = useMemo(() => fromISOTimeOrUndefined(maxTime), [maxTime]);
  const temporalDisabledDates = useMemo(() => adaptDisabledDates(disabledDates), [disabledDates]);

  const handleChange = useCallback((next: TemporalInstantRange | undefined) => onChange?.(toISOInstantRange(next)), [onChange]);

  // Controllable value state (external/committed value)
  const [committedValue, setCommittedValue] = useControllableState<TemporalInstantRange | undefined>({
    value: temporalValue,
    defaultValue: temporalDefaultValue,
    onChange: handleChange,
  });

  // Draft state (date range + time parts for both start and end)
  // Convert Instant to ZonedDateTime for editing
  const userTimeZone = Temporal.Now.timeZoneId();
  const zonedFrom = committedValue?.from?.toZonedDateTimeISO(userTimeZone);
  const zonedTo = committedValue?.to?.toZonedDateTimeISO(userTimeZone);

  const [draftDateRange, setDraftDateRange] = useState<DateRangeValue | undefined>(() => ({
    from: zonedFrom?.toPlainDate(),
    to: zonedTo?.toPlainDate(),
  }));

  // Start time state
  const [draftStartHour, setDraftStartHour] = useState<number>(12);
  const [draftStartMinute, setDraftStartMinute] = useState<number>(0);
  const [draftStartSecond, setDraftStartSecond] = useState<number>(0);
  const [draftStartPeriod, setDraftStartPeriod] = useState<TimePeriod>("AM");

  // End time state
  const [draftEndHour, setDraftEndHour] = useState<number>(12);
  const [draftEndMinute, setDraftEndMinute] = useState<number>(0);
  const [draftEndSecond, setDraftEndSecond] = useState<number>(0);
  const [draftEndPeriod, setDraftEndPeriod] = useState<TimePeriod>("PM");

  // Month navigation state (for calendar)
  const [month, setMonth] = useState<Temporal.PlainDate>(() => {
    if (committedValue?.from) {
      const tz = Temporal.Now.timeZoneId();
      const zoned = committedValue.from.toZonedDateTimeISO(tz);
      return zoned.toPlainDate();
    }
    return today();
  });

  // Compute presets
  const presetOptions = useMemo(() => {
    if (!showPresets) return undefined;
    const presetsToUse = customPresets || getDefaultPresets();
    return presetsToUse.map((preset) => ({
      label: preset.label,
      value: preset.value(),
    }));
  }, [customPresets, showPresets]);

  // Sync draft when popup opens
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (newOpen) {
        const tz = Temporal.Now.timeZoneId();
        if (committedValue?.from && committedValue?.to) {
          // Convert Instant to ZonedDateTime for editing
          const zonedFrom = committedValue.from.toZonedDateTimeISO(tz);
          const zonedTo = committedValue.to.toZonedDateTimeISO(tz);
          const dateTimeFrom = zonedFrom.toPlainDateTime();
          const dateTimeTo = zonedTo.toPlainDateTime();

          // Set draft from committed value
          setDraftDateRange({
            from: dateTimeFrom.toPlainDate(),
            to: dateTimeTo.toPlainDate(),
          });

          const startParsed = temporalToParsed(dateTimeFrom.toPlainTime());
          setDraftStartHour(clockFormat === "12h" ? to12Hour(startParsed.hour).hour12 : startParsed.hour);
          setDraftStartMinute(startParsed.minute);
          setDraftStartSecond(startParsed.second);
          setDraftStartPeriod(to12Hour(startParsed.hour).period);

          const endParsed = temporalToParsed(dateTimeTo.toPlainTime());
          setDraftEndHour(clockFormat === "12h" ? to12Hour(endParsed.hour).hour12 : endParsed.hour);
          setDraftEndMinute(endParsed.minute);
          setDraftEndSecond(endParsed.second);
          setDraftEndPeriod(to12Hour(endParsed.hour).period);

          setMonth(dateTimeFrom.toPlainDate());
        } else if (committedValue?.from) {
          // Only start is set
          const zonedFrom = committedValue.from.toZonedDateTimeISO(tz);
          const dateTimeFrom = zonedFrom.toPlainDateTime();

          setDraftDateRange({
            from: dateTimeFrom.toPlainDate(),
            to: undefined,
          });

          const startParsed = temporalToParsed(dateTimeFrom.toPlainTime());
          setDraftStartHour(clockFormat === "12h" ? to12Hour(startParsed.hour).hour12 : startParsed.hour);
          setDraftStartMinute(startParsed.minute);
          setDraftStartSecond(startParsed.second);
          setDraftStartPeriod(to12Hour(startParsed.hour).period);

          setMonth(dateTimeFrom.toPlainDate());
        } else {
          // No committed value - start fresh with empty range
          const now = getCurrentTime();

          setDraftDateRange({ from: undefined, to: undefined });

          const currentHour = now.hour;
          setDraftStartHour(clockFormat === "12h" ? to12Hour(currentHour).hour12 : currentHour);
          setDraftStartMinute(now.minute);
          setDraftStartSecond(now.second);
          setDraftStartPeriod(to12Hour(currentHour).period);

          setDraftEndHour(12);
          setDraftEndMinute(0);
          setDraftEndSecond(0);
          setDraftEndPeriod("PM");

          setMonth(today());
        }
      }
      setOpen(newOpen);
    },
    [committedValue, clockFormat]
  );

  // Get the current draft times as parsed times (24-hour)
  const getDraftStartTime = useCallback((): ParsedTime => {
    const hour24 = clockFormat === "12h" ? to24Hour(draftStartHour, draftStartPeriod) : draftStartHour;
    return {
      hour: hour24,
      minute: draftStartMinute,
      second: draftStartSecond,
    };
  }, [clockFormat, draftStartHour, draftStartMinute, draftStartSecond, draftStartPeriod]);

  const getDraftEndTime = useCallback((): ParsedTime => {
    const hour24 = clockFormat === "12h" ? to24Hour(draftEndHour, draftEndPeriod) : draftEndHour;
    return {
      hour: hour24,
      minute: draftEndMinute,
      second: draftEndSecond,
    };
  }, [clockFormat, draftEndHour, draftEndMinute, draftEndSecond, draftEndPeriod]);

  // Combine draft dates and times into the internal Temporal range
  const getDraftRange = useCallback((): TemporalInstantRange => {
    const tz = Temporal.Now.timeZoneId();

    const from = draftDateRange?.from
      ? draftDateRange.from
          .toPlainDateTime({
            hour: getDraftStartTime().hour,
            minute: getDraftStartTime().minute,
            second: getDraftStartTime().second,
          })
          .toZonedDateTime(tz)
          .toInstant()
      : undefined;

    const to = draftDateRange?.to
      ? draftDateRange.to
          .toPlainDateTime({
            hour: getDraftEndTime().hour,
            minute: getDraftEndTime().minute,
            second: getDraftEndTime().second,
          })
          .toZonedDateTime(tz)
          .toInstant()
      : undefined;

    return { from, to };
  }, [draftDateRange, getDraftStartTime, getDraftEndTime]);

  // Apply changes
  const handleApply = useCallback(() => {
    const range = getDraftRange();

    // Validate that end is after start
    if (range.from && range.to && Temporal.Instant.compare(range.from, range.to) > 0) {
      // Swap them
      setCommittedValue({ from: range.to, to: range.from });
    } else {
      setCommittedValue(range.from || range.to ? range : undefined);
    }

    setOpen(false);
  }, [getDraftRange, setCommittedValue]);

  // Cancel changes
  const handleCancel = useCallback(() => {
    const tz = Temporal.Now.timeZoneId();
    // Revert to committed value
    if (committedValue?.from) {
      const zonedFrom = committedValue.from.toZonedDateTimeISO(tz);
      const dateTimeFrom = zonedFrom.toPlainDateTime();

      setDraftDateRange({
        from: dateTimeFrom.toPlainDate(),
        to: committedValue.to ? committedValue.to.toZonedDateTimeISO(tz).toPlainDateTime().toPlainDate() : undefined,
      });

      const startParsed = temporalToParsed(dateTimeFrom.toPlainTime());
      setDraftStartHour(clockFormat === "12h" ? to12Hour(startParsed.hour).hour12 : startParsed.hour);
      setDraftStartMinute(startParsed.minute);
      setDraftStartSecond(startParsed.second);
      setDraftStartPeriod(to12Hour(startParsed.hour).period);
    }
    if (committedValue?.to) {
      const zonedTo = committedValue.to.toZonedDateTimeISO(tz);
      const dateTimeTo = zonedTo.toPlainDateTime();

      const endParsed = temporalToParsed(dateTimeTo.toPlainTime());
      setDraftEndHour(clockFormat === "12h" ? to12Hour(endParsed.hour).hour12 : endParsed.hour);
      setDraftEndMinute(endParsed.minute);
      setDraftEndSecond(endParsed.second);
      setDraftEndPeriod(to12Hour(endParsed.hour).period);
    }
    setOpen(false);
  }, [committedValue, clockFormat]);

  // Clear value
  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setCommittedValue(undefined);
    },
    [setCommittedValue]
  );

  // Apply preset
  const _handlePresetClick = useCallback(
    (preset: { label: string; value: DateTimeRangeValue }) => {
      setCommittedValue(fromISOInstantRange(preset.value));
      setOpen(false);
    },
    [setCommittedValue]
  );

  // Floating UI setup
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: handleOpenChange,
    placement: align === "start" ? "bottom-start" : "bottom-end",
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

  // IDs for accessibility
  const id = useId();
  const contentId = `datetimerangepicker-content-${id}`;
  const inputId = `datetimerangepicker-input-${id}`;

  // Display value (from committed value)
  const displayValue = committedValue ? formatRangeDisplay(committedValue, clockFormat, showSeconds) : "";
  const hasValue = Boolean(committedValue?.from || committedValue?.to);

  // Time selection handlers - Start time
  const handleStartHourChange = (hour: number) => setDraftStartHour(hour);
  const handleStartMinuteChange = (minute: number) => setDraftStartMinute(minute);
  const handleStartSecondChange = (second: number) => setDraftStartSecond(second);
  const handleStartPeriodChange = (period: TimePeriod) => setDraftStartPeriod(period);

  // Time selection handlers - End time
  const handleEndHourChange = (hour: number) => setDraftEndHour(hour);
  const handleEndMinuteChange = (minute: number) => setDraftEndMinute(minute);
  const handleEndSecondChange = (second: number) => setDraftEndSecond(second);
  const handleEndPeriodChange = (period: TimePeriod) => setDraftEndPeriod(period);

  // Generate time options
  const hours = generateHours(clockFormat);
  const minutes = generateMinutes(minuteStep);
  const seconds = generateSeconds();

  // Get current draft times
  const draftStartTime = getDraftStartTime();
  const draftEndTime = getDraftEndTime();

  // Check if a time is disabled
  const checkTimeDisabled = useCallback(
    (hour: number, minute: number, second: number): boolean => {
      const temporal = Temporal.PlainTime.from({ hour, minute, second });
      return isTimeDisabled(temporal, temporalMinTime, temporalMaxTime);
    },
    [temporalMinTime, temporalMaxTime]
  );

  return (
    <>
      {/* Trigger Input */}
      <div ref={ref} className="relative flex min-w-125 items-center">
        <CalendarIcon className="pointer-events-none absolute left-3 h-4 w-4 text-fg-subtle" />
        <input
          ref={refs.setReference as React.Ref<HTMLInputElement>}
          id={inputId}
          type="text"
          readOnly
          value={displayValue}
          placeholder={placeholder}
          disabled={isDisabled}
          role="combobox"
          aria-invalid={isInvalid}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? contentId : undefined}
          className={cn(
            `flex h-9 w-full min-w-125 cursor-pointer rounded-md border border-border-normal bg-transparent py-1 pl-9 text-sm shadow-xs transition-colors placeholder:text-fg-subtle focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-focus-ring disabled:cursor-not-allowed disabled:opacity-50`,
            clearable && hasValue ? "pr-9" : "pr-3",
            isInvalid && "border-border-danger",
            className
          )}
          {...getReferenceProps()}
        />
        {clearable && hasValue && !isDisabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 rounded-sm p-0.5 text-fg-subtle hover:bg-bg-subtle hover:text-fg-normal focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-focus-ring"
            aria-label="Clear datetime range"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Hidden inputs for form submission */}
        {name && committedValue?.from && <input type="hidden" name={`${name}.from`} value={committedValue.from.toString()} />}
        {name && committedValue?.to && <input type="hidden" name={`${name}.to`} value={committedValue.to.toString()} />}
      </div>

      {/* Popover Content */}
      {open && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            id={contentId}
            role="dialog"
            aria-modal="true"
            style={floatingStyles}
            className="z-popover rounded-xl border border-border-normal bg-bg-normal p-4 shadow-lg"
            {...getFloatingProps()}
          >
            {/* Top row: Presets + Calendar */}
            <div className="flex gap-4">
              {presetOptions && presetOptions.length > 0 && (
                <>
                  <div className="flex flex-col gap-1">
                    <div className="mb-2 font-semibold text-sm">Presets</div>
                    <div className="flex flex-col gap-1">
                      {presetOptions.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => _handlePresetClick(preset)}
                          className={cn(
                            "rounded-md px-3 py-1.5 text-left text-sm transition-colors",
                            "hover:bg-bg-subtle focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-inset"
                          )}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Separator orientation="vertical" />
                </>
              )}

              {/* Date Calendar */}
              <CalendarView
                mode="range"
                value={draftDateRange}
                onSelect={setDraftDateRange as (range: DateRangeValue | undefined) => void}
                month={month}
                onMonthChange={setMonth}
                minDate={temporalMinDate}
                maxDate={temporalMaxDate}
                disabled={temporalDisabledDates}
                weekStartsOn={weekStartsOn}
                showFooter={false}
              />
            </div>

            <Separator className="my-3" />

            {/* Bottom row: Time Pickers */}
            <div className="flex gap-4">
              {/* Start Time Picker */}
              <div className="flex flex-1 flex-col gap-3">
                <div className="font-semibold text-sm">Start Time</div>

                {/* Time columns */}
                <div className="flex gap-2">
                  {/* Hours */}
                  <div className="flex flex-col gap-1">
                    <div className="text-center font-medium text-fg-subtle text-xs">Hour</div>
                    <TimeColumn
                      values={hours}
                      selected={draftStartHour}
                      onSelect={handleStartHourChange}
                      disabled={(hour: number) => {
                        const hour24 = clockFormat === "12h" ? to24Hour(hour, draftStartPeriod) : hour;
                        return checkTimeDisabled(hour24, draftStartMinute, draftStartSecond);
                      }}
                    />
                  </div>

                  {/* Minutes */}
                  <div className="flex flex-col gap-1">
                    <div className="text-center font-medium text-fg-subtle text-xs">Min</div>
                    <TimeColumn
                      values={minutes}
                      selected={draftStartMinute}
                      onSelect={handleStartMinuteChange}
                      disabled={(minute: number) => checkTimeDisabled(draftStartTime.hour, minute, draftStartSecond)}
                    />
                  </div>

                  {/* Seconds (optional) */}
                  {showSeconds && (
                    <div className="flex flex-col gap-1">
                      <div className="text-center font-medium text-fg-subtle text-xs">Sec</div>
                      <TimeColumn
                        values={seconds}
                        selected={draftStartSecond}
                        onSelect={handleStartSecondChange}
                        disabled={(second: number) => checkTimeDisabled(draftStartTime.hour, draftStartMinute, second)}
                      />
                    </div>
                  )}

                  {/* AM/PM (12h format only) */}
                  {clockFormat === "12h" && (
                    <div className="flex flex-col gap-1">
                      <div className="text-center font-medium text-fg-subtle text-xs">&nbsp;</div>
                      <PeriodSelector value={draftStartPeriod} onChange={handleStartPeriodChange} />
                    </div>
                  )}
                </div>
              </div>

              <Separator orientation="vertical" />

              {/* End Time Picker */}
              <div className="flex flex-1 flex-col gap-3">
                <div className="font-semibold text-sm">End Time</div>

                {/* Time columns */}
                <div className="flex gap-2">
                  {/* Hours */}
                  <div className="flex flex-col gap-1">
                    <div className="text-center font-medium text-fg-subtle text-xs">Hour</div>
                    <TimeColumn
                      values={hours}
                      selected={draftEndHour}
                      onSelect={handleEndHourChange}
                      disabled={(hour: number) => {
                        const hour24 = clockFormat === "12h" ? to24Hour(hour, draftEndPeriod) : hour;
                        return checkTimeDisabled(hour24, draftEndMinute, draftEndSecond);
                      }}
                    />
                  </div>

                  {/* Minutes */}
                  <div className="flex flex-col gap-1">
                    <div className="text-center font-medium text-fg-subtle text-xs">Min</div>
                    <TimeColumn
                      values={minutes}
                      selected={draftEndMinute}
                      onSelect={handleEndMinuteChange}
                      disabled={(minute: number) => checkTimeDisabled(draftEndTime.hour, minute, draftEndSecond)}
                    />
                  </div>

                  {/* Seconds (optional) */}
                  {showSeconds && (
                    <div className="flex flex-col gap-1">
                      <div className="text-center font-medium text-fg-subtle text-xs">Sec</div>
                      <TimeColumn
                        values={seconds}
                        selected={draftEndSecond}
                        onSelect={handleEndSecondChange}
                        disabled={(second: number) => checkTimeDisabled(draftEndTime.hour, draftEndMinute, second)}
                      />
                    </div>
                  )}

                  {/* AM/PM (12h format only) */}
                  {clockFormat === "12h" && (
                    <div className="flex flex-col gap-1">
                      <div className="text-center font-medium text-fg-subtle text-xs">&nbsp;</div>
                      <PeriodSelector value={draftEndPeriod} onChange={handleEndPeriodChange} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-3" />

            {/* Footer with Cancel / Apply */}
            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="button" variant="solid" size="sm" onClick={handleApply}>
                Apply
              </Button>
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  );
});
DateTimeRangePicker.displayName = "DateTimeRangePicker";
