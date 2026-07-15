import { autoUpdate, FloatingPortal, flip, offset, shift, useClick, useDismiss, useFloating, useInteractions } from "@floating-ui/react";
import { Temporal, today } from "@sixthshift/temporal";
import { useControllableState } from "@sixthshift/ui/hooks";
import { cn } from "@sixthshift/ui/utils";
import { Clock, X } from "lucide-react";
import type * as React from "react";
import { useCallback, useId, useState } from "react";

import { Button } from "../Button";
import { Calendar } from "../Calendar";
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
import type { DateTimePickerProps } from "./datetimepicker.types";

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
 * DateTimePicker - A component for selecting both date and time
 *
 * Combines date and time selection in a single popup with side-by-side layout.
 * Uses Temporal.Instant for all values (timezone-aware).
 */
export const DateTimePicker = (props: DateTimePickerProps) => {
  const {
    value,
    defaultValue,
    onChange,
    minDate,
    maxDate,
    disabledDates,
    minTime,
    maxTime,
    minuteStep = 1,
    clockFormat = "12h",
    showSeconds = false,
    placeholder = "Select date and time...",
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

  // Controllable value state (external/committed value)
  const [committedValue, setCommittedValue] = useControllableState({
    value,
    defaultValue,
    onChange,
  });

  // Draft state (date + time parts)
  // Convert Instant to ZonedDateTime for editing
  const userTimeZone = Temporal.Now.timeZoneId();
  const zonedValue = committedValue?.toZonedDateTimeISO(userTimeZone);

  const [draftDate, setDraftDate] = useState<Temporal.PlainDate | undefined>(zonedValue?.toPlainDate());
  const [draftHour, setDraftHour] = useState<number>(12);
  const [draftMinute, setDraftMinute] = useState<number>(0);
  const [draftSecond, setDraftSecond] = useState<number>(0);
  const [draftPeriod, setDraftPeriod] = useState<TimePeriod>("PM");

  // Month navigation state (for calendar)
  const [month, setMonth] = useState<Temporal.PlainDate>(() => {
    if (committedValue) {
      const zoned = committedValue.toZonedDateTimeISO(userTimeZone);
      return zoned.toPlainDate();
    }
    return today();
  });

  // Sync draft when popup opens
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (newOpen) {
        const tz = Temporal.Now.timeZoneId();
        if (committedValue) {
          // Convert Instant to ZonedDateTime for editing
          const zoned = committedValue.toZonedDateTimeISO(tz);
          const dateTime = zoned.toPlainDateTime();

          setDraftDate(dateTime.toPlainDate());
          const parsed = temporalToParsed(dateTime.toPlainTime());
          setDraftHour(clockFormat === "12h" ? to12Hour(parsed.hour).hour12 : parsed.hour);
          setDraftMinute(parsed.minute);
          setDraftSecond(parsed.second);
          setDraftPeriod(to12Hour(parsed.hour).period);
          setMonth(dateTime.toPlainDate());
        } else {
          // Default to today + current time
          const todayDate = today();
          const now = getCurrentTime();
          setDraftDate(todayDate);
          const currentHour = now.hour;
          setDraftHour(clockFormat === "12h" ? to12Hour(currentHour).hour12 : currentHour);
          setDraftMinute(now.minute);
          setDraftSecond(now.second);
          setDraftPeriod(to12Hour(currentHour).period);
          setMonth(todayDate);
        }
      }
      setOpen(newOpen);
    },
    [committedValue, clockFormat]
  );

  // Get the current draft as a parsed time (24-hour)
  const getDraftTime = useCallback((): ParsedTime => {
    const hour24 = clockFormat === "12h" ? to24Hour(draftHour, draftPeriod) : draftHour;
    return {
      hour: hour24,
      minute: draftMinute,
      second: draftSecond,
    };
  }, [clockFormat, draftHour, draftMinute, draftSecond, draftPeriod]);

  // Apply changes
  const handleApply = useCallback(() => {
    if (!draftDate) {
      setOpen(false);
      return;
    }

    const draftTime = getDraftTime();
    const plainDateTime = draftDate.toPlainDateTime({
      hour: draftTime.hour,
      minute: draftTime.minute,
      second: showSeconds ? draftTime.second : 0,
    });

    // Convert PlainDateTime to ZonedDateTime in user's timezone, then to Instant
    const tz = Temporal.Now.timeZoneId();
    const zoned = plainDateTime.toZonedDateTime(tz);
    const instant = zoned.toInstant();

    setCommittedValue(instant);
    setOpen(false);
  }, [draftDate, getDraftTime, showSeconds, setCommittedValue]);

  // Cancel changes
  const handleCancel = useCallback(() => {
    // Revert to committed value
    if (committedValue) {
      const tz = Temporal.Now.timeZoneId();
      const zoned = committedValue.toZonedDateTimeISO(tz);
      const dateTime = zoned.toPlainDateTime();

      setDraftDate(dateTime.toPlainDate());
      const parsed = temporalToParsed(dateTime.toPlainTime());
      setDraftHour(clockFormat === "12h" ? to12Hour(parsed.hour).hour12 : parsed.hour);
      setDraftMinute(parsed.minute);
      setDraftSecond(parsed.second);
      setDraftPeriod(to12Hour(parsed.hour).period);
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
  const contentId = `datetimepicker-content-${id}`;
  const inputId = `datetimepicker-input-${id}`;

  // Display value (from committed value)
  const displayValue = committedValue ? formatInstantDisplay(committedValue, clockFormat, showSeconds) : "";
  const hasValue = Boolean(committedValue);

  // Time selection handlers
  const handleHourChange = (hour: number) => setDraftHour(hour);
  const handleMinuteChange = (minute: number) => setDraftMinute(minute);
  const handleSecondChange = (second: number) => setDraftSecond(second);
  const handlePeriodChange = (period: TimePeriod) => setDraftPeriod(period);

  // Generate time options
  const hours = generateHours(clockFormat);
  const minutes = generateMinutes(minuteStep);
  const seconds = generateSeconds();

  // Get current draft time for TimePicker display
  const draftTime = getDraftTime();

  // Check if a time is disabled
  const checkTimeDisabled = useCallback(
    (hour: number, minute: number, second: number): boolean => {
      const temporal = Temporal.PlainTime.from({ hour, minute, second });
      return isTimeDisabled(temporal, minTime, maxTime);
    },
    [minTime, maxTime]
  );

  return (
    <>
      {/* Trigger Input */}
      <div className="relative flex items-center">
        <Clock className="pointer-events-none absolute left-3 h-4 w-4 text-fg-subtle" />
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
            `flex h-9 w-full cursor-pointer rounded-md border border-border-normal bg-transparent py-1 pl-9 text-sm shadow-xs transition-colors placeholder:text-fg-subtle focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-focus-ring disabled:cursor-not-allowed disabled:opacity-50`,
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
            aria-label="Clear date and time"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Hidden input for form submission */}
        {name && committedValue && <input type="hidden" name={name} value={committedValue.toString()} />}
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
            <div className="flex gap-4">
              {/* Date Calendar (left side) */}
              <Calendar
                mode="single"
                value={draftDate}
                onSelect={setDraftDate as (date: Temporal.PlainDate | undefined) => void}
                month={month}
                onMonthChange={setMonth}
                minDate={minDate}
                maxDate={maxDate}
                disabled={disabledDates}
                weekStartsOn={weekStartsOn}
                showFooter={false}
              />

              <Separator orientation="vertical" />

              {/* Time Picker (right side) */}
              <div className="flex flex-col gap-3">
                <div className="text-center font-semibold text-sm">Time</div>

                {/* Time columns */}
                <div className="flex gap-2">
                  {/* Hours */}
                  <div className="flex flex-col gap-1">
                    <div className="text-center font-medium text-fg-subtle text-xs">Hour</div>
                    <TimeColumn
                      values={hours}
                      selected={draftHour}
                      onSelect={handleHourChange}
                      disabled={(hour: number) => {
                        const hour24 = clockFormat === "12h" ? to24Hour(hour, draftPeriod) : hour;
                        return checkTimeDisabled(hour24, draftMinute, draftSecond);
                      }}
                    />
                  </div>

                  {/* Minutes */}
                  <div className="flex flex-col gap-1">
                    <div className="text-center font-medium text-fg-subtle text-xs">Min</div>
                    <TimeColumn
                      values={minutes}
                      selected={draftMinute}
                      onSelect={handleMinuteChange}
                      disabled={(minute: number) => checkTimeDisabled(draftTime.hour, minute, draftSecond)}
                    />
                  </div>

                  {/* Seconds (optional) */}
                  {showSeconds && (
                    <div className="flex flex-col gap-1">
                      <div className="text-center font-medium text-fg-subtle text-xs">Sec</div>
                      <TimeColumn
                        values={seconds}
                        selected={draftSecond}
                        onSelect={handleSecondChange}
                        disabled={(second: number) => checkTimeDisabled(draftTime.hour, draftMinute, second)}
                      />
                    </div>
                  )}

                  {/* AM/PM (12h format only) */}
                  {clockFormat === "12h" && (
                    <div className="flex flex-col gap-1">
                      <div className="text-center font-medium text-fg-subtle text-xs">&nbsp;</div>
                      <PeriodSelector value={draftPeriod} onChange={handlePeriodChange} />
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
};
