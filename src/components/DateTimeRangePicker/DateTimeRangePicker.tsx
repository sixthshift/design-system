"use client";

import { autoUpdate, FloatingPortal, flip, offset, shift, useClick, useDismiss, useFloating, useInteractions } from "@floating-ui/react";
import { useControllableState } from "@sixthshift/design-system/hooks";
import { cn } from "@sixthshift/design-system/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";
import { useCallback, useId, useMemo, useRef, useState } from "react";
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

import { PickerField } from "../../internal";
import { Button } from "../Button";
import { CalendarView } from "../Calendar/CalendarView";
import { isDateDisabled } from "../Calendar/calendar.hooks";
import type { DateRangeValue } from "../Calendar/calendar.types";
import { DateTimeSegments } from "../DateTimePicker/DateTimeSegments";
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
 * Combines a single range calendar with two sets of time columns — Start Time
 * and End Time — shown side by side below it. Like `DateTimePicker`, it is
 * not a composition of other picker components: it builds directly on the
 * same internal calendar grid and time-column primitives `TimePicker` and
 * `DateTimePicker` use.
 *
 * The trigger is two typeable fields, one per end — each a full date-and-time
 * (`1520260900a` is January 5th 2026 at 9am), each with its own clear button,
 * sharing one popover that anchors to whichever half is being edited. A typed
 * end that falls outside `minDate`/`maxDate`/`minTime`/`maxTime` is flagged
 * rather than clamped. See `SegmentedField` for the keyboard model.
 *
 * The value is an `ISOInstantRange` (`{ from?: ISOInstant, to?: ISOInstant }`,
 * exported as `DateTimeRangeValue` for historical reasons) — both ends
 * absolute instants, always UTC and ending in `Z`. Each end is edited in the
 * viewer's local timezone and converted to/from UTC at the boundary. Supports
 * controlled (`value`/`onChange`) and uncontrolled (`defaultValue`) use.
 *
 * Opening the popover seeds date-range and time drafts from the committed
 * value; the footer's Apply combines them into an instant range and commits,
 * Cancel discards the draft. `minDate`/`maxDate` and `disabledDates` bound the
 * date grid. `minTime`/`maxTime` are wall-clock bounds that apply to **both**
 * the start and end time columns identically — they do not mean "start no
 * earlier than X, end no later than Y" relative to each other, and they say
 * nothing about the resulting instants (a `maxTime` of `17:00` still allows an
 * end date after the start date). `presets` (a zero-arg-function value, like
 * `DateRangePicker`) replaces the built-in preset list; `showPresets={false}`
 * hides the sidebar.
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
    segmentOrder = "mdy",
    showSeconds = false,
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
  // The day grid takes focus only when the popover was opened from the keyboard.
  const [autoFocusDay, setAutoFocusDay] = useState(false);

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

  // Display value (from committed value)

  // ---------------------------------------------------------------------------
  // Two typeable fields, one per end.
  //
  // A range is two instants, and typing one should not require knowing where the
  // other ends. Each half is its own segmented field with its own clear button;
  // they share the one popover, which anchors to whichever half is being edited.
  // While it is open the fields show the draft, so picking in the grid or the
  // columns shows up in the segments and vice versa.
  // ---------------------------------------------------------------------------

  const draftRange = getDraftRange();
  const shownFor = (end: "from" | "to") => (open ? draftRange[end] : committedValue?.[end]);

  /**
   * A typed end can fall outside what the grid and columns allow. The field
   * flags it rather than clamping; see `DatePicker` for why.
   */
  const outOfBounds = (instant: Temporal.Instant | undefined) => {
    if (!instant) return false;
    const zoned = instant.toZonedDateTimeISO(userTimeZone);
    return (
      isDateDisabled(zoned.toPlainDate(), temporalDisabledDates, temporalMinDate, temporalMaxDate) ||
      isTimeDisabled(zoned.toPlainTime(), temporalMinTime, temporalMaxTime)
    );
  };

  const setRangeEnd = useCallback(
    (end: "from" | "to", instant: Temporal.Instant | undefined) => {
      if (!open) {
        const next = { from: end === "from" ? instant : committedValue?.from, to: end === "to" ? instant : committedValue?.to };
        setCommittedValue(next.from || next.to ? next : undefined);
        return;
      }

      if (!instant) {
        setDraftDateRange((current) => ({ from: end === "from" ? undefined : current?.from, to: end === "to" ? undefined : current?.to }));
        return;
      }

      const zoned = instant.toZonedDateTimeISO(userTimeZone);
      const parsed = temporalToParsed(zoned.toPlainTime());
      setDraftDateRange((current) => ({
        from: end === "from" ? zoned.toPlainDate() : current?.from,
        to: end === "to" ? zoned.toPlainDate() : current?.to,
      }));
      if (end === "from") {
        setDraftStartHour(clockFormat === "12h" ? to12Hour(parsed.hour).hour12 : parsed.hour);
        setDraftStartMinute(parsed.minute);
        setDraftStartSecond(parsed.second);
        setDraftStartPeriod(to12Hour(parsed.hour).period);
      } else {
        setDraftEndHour(clockFormat === "12h" ? to12Hour(parsed.hour).hour12 : parsed.hour);
        setDraftEndMinute(parsed.minute);
        setDraftEndSecond(parsed.second);
        setDraftEndPeriod(to12Hour(parsed.hour).period);
      }
    },
    [clockFormat, committedValue, open, setCommittedValue, userTimeZone]
  );

  const clearRangeEnd = useCallback(
    (end: "from" | "to") => (event: React.MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      const next = { from: end === "from" ? undefined : committedValue?.from, to: end === "to" ? undefined : committedValue?.to };
      // Clearing the last remaining end clears the range itself.
      setCommittedValue(next.from || next.to ? next : undefined);
    },
    [committedValue, setCommittedValue]
  );

  const rangeHalves = useRef<Record<"from" | "to", HTMLDivElement | null>>({ from: null, to: null });
  const anchorToHalf = useCallback(
    (end: "from" | "to") => {
      const node = rangeHalves.current[end];
      if (node) refs.setPositionReference(node);
    },
    [refs]
  );

  /** `Alt+ArrowDown` from a segment: open the popover *and* go to the grid. */
  const openWithGridFocus = useCallback(
    (end: "from" | "to") => () => {
      anchorToHalf(end);
      setAutoFocusDay(true);
      handleOpenChange(true);
    },
    [anchorToHalf, handleOpenChange]
  );

  /** `Enter` in a segment commits the draft, matching the popover's Apply. */
  const handleFieldSubmit = useCallback(() => {
    if (open) handleApply();
  }, [handleApply, open]);

  /**
   * One end of the range. A render function rather than a component so the
   * fields are not remounted — and focus is not dropped — on every keystroke.
   */
  const renderRangeHalf = (end: "from" | "to", label: string) => {
    const settled = committedValue?.[end];

    return (
      <PickerField
        ref={(node) => {
          rangeHalves.current[end] = node;
        }}
        onFocusCapture={() => anchorToHalf(end)}
        className="min-w-70 flex-1"
        icon={<CalendarIcon className="h-4 w-4" />}
        toggleLabel={`Open picker for ${label.toLowerCase()}`}
        // Both handlers have to run: Floating UI's opens the popover, and ours
        // points it at this half. Spreading after `onClick` would drop ours on
        // the floor, which is how the popover ended up anchored to the whole
        // trigger.
        toggleProps={getReferenceProps({ onClick: () => anchorToHalf(end) })}
        isOpen={open}
        contentId={contentId}
        isDisabled={isDisabled}
        isInvalid={isInvalid || outOfBounds(shownFor(end))}
        onClear={clearable && settled && !isDisabled ? clearRangeEnd(end) : undefined}
        clearLabel={`Clear ${label.toLowerCase()}`}
      >
        <DateTimeSegments
          className="h-full flex-1"
          label={label}
          value={shownFor(end)}
          onChange={(instant) => setRangeEnd(end, instant)}
          timeZone={userTimeZone}
          order={segmentOrder}
          clockFormat={clockFormat}
          showSeconds={showSeconds}
          isDisabled={isDisabled}
          isInvalid={isInvalid || outOfBounds(shownFor(end))}
          onOpenRequest={openWithGridFocus(end)}
          onSubmit={handleFieldSubmit}
        />
      </PickerField>
    );
  };

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
      <div
        ref={(node) => {
          // The container is the interaction reference, so a click in either half
          // counts as inside; the *position* reference follows the active half.
          refs.setReference(node);
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={cn("relative flex min-w-125 items-center gap-2", className)}
      >
        {renderRangeHalf("from", "Start date and time")}
        <span aria-hidden="true" className="text-fg-subtle">
          –
        </span>
        {renderRangeHalf("to", "End date and time")}

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
            aria-label="Choose date and time range"
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
                autoFocusDay={autoFocusDay}
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
DateTimeRangePicker.displayName = "DateTimeRangePicker";
