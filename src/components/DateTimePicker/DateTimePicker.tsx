"use client";

import { autoUpdate, FloatingPortal, flip, offset, shift, useClick, useDismiss, useFloating, useInteractions } from "@floating-ui/react";
import { useControllableState } from "@sixthshift/design-system/hooks";
import { cn } from "@sixthshift/design-system/utils";
import { Clock } from "lucide-react";
import * as React from "react";
import { useCallback, useId, useMemo, useState } from "react";
import {
  adaptDisabledDates,
  fromISODateOrUndefined,
  fromISOInstantOrUndefined,
  fromISOTimeOrUndefined,
  Temporal,
  today,
  toISOInstantOrUndefined,
} from "../../date-time";

import { PickerField } from "../../internal";
import { Button } from "../Button";
import { CalendarView } from "../Calendar/CalendarView";
import { isDateDisabled } from "../Calendar/calendar.hooks";
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
import { DateTimeSegments } from "./DateTimeSegments";
import type { DateTimePickerProps } from "./datetimepicker.types";

/**
 * DateTimePicker - A component for selecting both date and time
 *
 * Combines date and time selection in a single popup with side-by-side layout:
 * a `Calendar` grid on the left, hour/minute(/second) columns on the right.
 *
 * The trigger is one typeable field of date *and* time segments — one value, so
 * the digits roll straight from the year into the hour: `1520260330p` is January
 * 5th 2026 at 3:30pm, typed without a tab. `segmentOrder` sets the date half's
 * order (never inferred from the locale), `clockFormat` decides the hour's range
 * and whether there is an AM/PM segment, and `Alt+ArrowDown` opens the popover
 * on the month being typed. See `SegmentedField` for the whole keyboard model.
 * It is not a composition of `DatePicker` and `TimePicker` — it builds
 * directly on the same internal calendar grid and time-column primitives
 * those two use, so the two stay visually consistent without either being
 * mounted as a component.
 *
 * The value is a single absolute instant: an `ISOInstant` string
 * (`"2026-08-26T00:30:00Z"`), always UTC and always ending in `Z`. It is
 * edited in the viewer's local timezone (`Temporal.Now.timeZoneId()`) and
 * converted to/from UTC at the boundary, so the same stored instant displays
 * differently to viewers in different timezones. Input written with a
 * numeric offset is normalised to the `Z` form. Supports controlled
 * (`value`/`onChange`) and uncontrolled (`defaultValue`) use.
 *
 * Opening the popover seeds date and time drafts from the committed value (or
 * today + the current time, if none); the footer's Apply combines them into
 * an instant and commits, Cancel discards the draft. `minDate`/`maxDate` and
 * `disabledDates` bound the date grid; `minTime`/`maxTime` bound the wall-clock
 * time columns — these are plain date/time constraints on the picker's grid,
 * not constraints on the resulting instant. `clockFormat` and `showSeconds`
 * control the time columns; `clearable` (default `true`) shows the clear
 * button.
 */
export const DateTimePicker = React.forwardRef<HTMLDivElement, DateTimePickerProps>((props, ref) => {
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
    weekStartsOn = 0,
    name,
    isDisabled = false,
    isInvalid = false,
    className,
    align = "end",
    clearable = true,
    segmentOrder = "mdy",
  } = props;

  // Open state
  const [open, setOpen] = useState(false);
  // The day grid takes focus only when the popover was opened from the keyboard.
  const [autoFocusDay, setAutoFocusDay] = useState(false);

  // ---------------------------------------------------------------------------
  // The ISO boundary.
  //
  // The value crosses as a canonical UTC instant string; constraints cross as
  // ISO dates and times. Below this block everything is Temporal, exactly as
  // before. Each conversion is memoised on its source string so the Temporal
  // values stay referentially stable across renders.
  // ---------------------------------------------------------------------------

  const temporalValue = useMemo(() => fromISOInstantOrUndefined(value), [value]);
  const temporalDefaultValue = useMemo(() => fromISOInstantOrUndefined(defaultValue), [defaultValue]);
  const temporalMinDate = useMemo(() => fromISODateOrUndefined(minDate), [minDate]);
  const temporalMaxDate = useMemo(() => fromISODateOrUndefined(maxDate), [maxDate]);
  const temporalMinTime = useMemo(() => fromISOTimeOrUndefined(minTime), [minTime]);
  const temporalMaxTime = useMemo(() => fromISOTimeOrUndefined(maxTime), [maxTime]);
  const temporalDisabledDates = useMemo(() => adaptDisabledDates(disabledDates), [disabledDates]);

  const handleChange = useCallback((next: Temporal.Instant | undefined) => onChange?.(toISOInstantOrUndefined(next)), [onChange]);

  // Controllable value state (external/committed value)
  const [committedValue, setCommittedValue] = useControllableState<Temporal.Instant | undefined>({
    value: temporalValue,
    defaultValue: temporalDefaultValue,
    onChange: handleChange,
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
      if (!newOpen) setAutoFocusDay(false);
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
  const hasValue = Boolean(committedValue);

  // ---------------------------------------------------------------------------
  // The typeable field.
  //
  // The segments show the draft while the popover is open and the committed
  // value while it is closed, so typing moves the grid and columns, and picking
  // in either shows up in the segments. Open means the popover's Apply/Cancel
  // owns the value; closed means a complete date-time commits as soon as it is
  // complete.
  //
  // The draft is a date plus loose time parts, so it only composes into an
  // instant once the date exists. Until then the field has nothing to show,
  // which is exactly `undefined`.
  // ---------------------------------------------------------------------------

  const userZone = Temporal.Now.timeZoneId();

  const draftInstant = useMemo(() => {
    if (!draftDate) return undefined;
    const parsed = getDraftTime();
    return draftDate
      .toPlainDateTime({ hour: parsed.hour, minute: parsed.minute, second: showSeconds ? parsed.second : 0 })
      .toZonedDateTime(userZone)
      .toInstant();
  }, [draftDate, getDraftTime, showSeconds, userZone]);

  const segmentValue = open ? draftInstant : committedValue;

  /**
   * A typed instant can fall outside what the grid and columns allow — the date
   * past `maxDate`, or the time outside `minTime`/`maxTime`. The field flags it
   * rather than clamping; see `DatePicker` for why.
   */
  const outOfBounds = useMemo(() => {
    if (!segmentValue) return false;
    const zoned = segmentValue.toZonedDateTimeISO(userZone);
    return (
      isDateDisabled(zoned.toPlainDate(), temporalDisabledDates, temporalMinDate, temporalMaxDate) ||
      isTimeDisabled(zoned.toPlainTime(), temporalMinTime, temporalMaxTime)
    );
  }, [segmentValue, temporalDisabledDates, temporalMaxDate, temporalMaxTime, temporalMinDate, temporalMinTime, userZone]);

  const handleSegmentsChange = useCallback(
    (instant: Temporal.Instant | undefined) => {
      if (!open) {
        setCommittedValue(instant);
        return;
      }
      if (!instant) {
        setDraftDate(undefined);
        return;
      }
      const zoned = instant.toZonedDateTimeISO(userZone);
      const parsed = temporalToParsed(zoned.toPlainTime());
      setDraftDate(zoned.toPlainDate());
      setMonth(zoned.toPlainDate());
      setDraftHour(clockFormat === "12h" ? to12Hour(parsed.hour).hour12 : parsed.hour);
      setDraftMinute(parsed.minute);
      setDraftSecond(parsed.second);
      setDraftPeriod(to12Hour(parsed.hour).period);
    },
    [clockFormat, open, setCommittedValue, userZone]
  );

  /** `Alt+ArrowDown` from a segment: open the popover *and* go to the grid. */
  const openWithGridFocus = useCallback(() => {
    setAutoFocusDay(true);
    handleOpenChange(true);
  }, [handleOpenChange]);

  /** `Enter` in a segment commits the draft, matching the popover's Apply. */
  const handleFieldSubmit = useCallback(() => {
    if (open) handleApply();
  }, [handleApply, open]);

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
      return isTimeDisabled(temporal, temporalMinTime, temporalMaxTime);
    },
    [temporalMinTime, temporalMaxTime]
  );

  return (
    <>
      {/* Trigger Input */}
      <div ref={ref} className="relative flex items-center">
        <PickerField
          ref={refs.setReference as React.Ref<HTMLDivElement>}
          className={cn("w-full min-w-80", className)}
          icon={<Clock className="h-4 w-4" />}
          toggleLabel="Open date and time picker"
          toggleProps={getReferenceProps()}
          isOpen={open}
          contentId={contentId}
          isDisabled={isDisabled}
          isInvalid={isInvalid || outOfBounds}
          onClear={clearable && hasValue && !isDisabled ? handleClear : undefined}
          clearLabel="Clear date and time"
        >
          <DateTimeSegments
            className="h-full flex-1"
            id={inputId}
            value={segmentValue}
            onChange={handleSegmentsChange}
            timeZone={userZone}
            order={segmentOrder}
            clockFormat={clockFormat}
            showSeconds={showSeconds}
            isDisabled={isDisabled}
            isInvalid={isInvalid || outOfBounds}
            onOpenRequest={openWithGridFocus}
            onSubmit={handleFieldSubmit}
          />
        </PickerField>

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
            aria-label="Choose date and time"
            style={floatingStyles}
            className="z-popover rounded-xl border border-border-normal bg-bg-normal p-4 shadow-lg"
            {...getFloatingProps()}
          >
            <div className="flex gap-4">
              {/* Date Calendar (left side) */}
              <CalendarView
                mode="single"
                value={draftDate}
                onSelect={setDraftDate as (date: Temporal.PlainDate | undefined) => void}
                month={month}
                onMonthChange={setMonth}
                minDate={temporalMinDate}
                maxDate={temporalMaxDate}
                disabled={temporalDisabledDates}
                weekStartsOn={weekStartsOn}
                showFooter={false}
                autoFocusDay={autoFocusDay}
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
              <Button type="button" variant="solid" intent="brand" size="sm" onClick={handleApply}>
                Apply
              </Button>
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  );
});
DateTimePicker.displayName = "DateTimePicker";
