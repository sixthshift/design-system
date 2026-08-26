import { autoUpdate, FloatingPortal, flip, offset, shift, useClick, useDismiss, useFloating, useInteractions } from "@floating-ui/react";
import { useControllableState } from "@sixthshift/design-system/hooks";
import { cn } from "@sixthshift/design-system/utils";
import { Clock, X } from "lucide-react";
import type * as React from "react";
import { useCallback, useId, useMemo, useState } from "react";
import { fromISOTime, fromISOTimeOrUndefined, type Temporal, toISOTimeOrUndefined } from "../../date-time";
import { Button } from "../Button";
import { Separator } from "../Separator";
import { PeriodSelector } from "./PeriodSelector";
import { TimeColumn } from "./TimeColumn";
import {
  formatTimeDisplay,
  generateHours,
  generateMinutes,
  generateSeconds,
  getCurrentTime,
  isTimeDisabled,
  parsedToTemporal,
  temporalTimeToISO,
  temporalToParsed,
  to12Hour,
  to24Hour,
} from "./timepicker.hooks";
import type { ParsedTime, TimePeriod, TimePickerProps, TimePresetOption } from "./timepicker.types";

export type { TimePickerProps };

export const TimePicker = (props: TimePickerProps) => {
  const {
    value,
    defaultValue,
    onChange,
    format = "HH:mm",
    clockFormat = "12h",
    minuteStep = 1,
    minTime,
    maxTime,
    presets,
    placeholder = "Select time",
    name,
    isDisabled = false,
    isInvalid = false,
    className,
  } = props;

  // Open state
  const [open, setOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // The ISO boundary.
  //
  // Props arrive as ISO time strings and onChange emits the canonical
  // `HH:MM:SS` form; everything below works in Temporal.PlainTime as before.
  // Each conversion is memoised on its source string, so the Temporal values
  // handed to the hooks below stay referentially stable across renders.
  // ---------------------------------------------------------------------------

  const temporalValue = useMemo(() => fromISOTimeOrUndefined(value), [value]);
  const temporalDefaultValue = useMemo(() => fromISOTimeOrUndefined(defaultValue), [defaultValue]);
  const temporalMinTime = useMemo(() => fromISOTimeOrUndefined(minTime), [minTime]);
  const temporalMaxTime = useMemo(() => fromISOTimeOrUndefined(maxTime), [maxTime]);

  const handleChange = useCallback((next: Temporal.PlainTime | undefined) => onChange?.(toISOTimeOrUndefined(next)), [onChange]);

  // Controllable value state (external/committed value)
  const [committedValue, setCommittedValue] = useControllableState<Temporal.PlainTime | undefined>({
    value: temporalValue,
    defaultValue: temporalDefaultValue,
    onChange: handleChange,
  });

  // Parse committed value
  const parsedCommitted = committedValue ? temporalToParsed(committedValue) : undefined;

  // Draft state (internal while popup is open)
  const [draftHour, setDraftHour] = useState<number>(parsedCommitted?.hour ?? 12);
  const [draftMinute, setDraftMinute] = useState<number>(parsedCommitted?.minute ?? 0);
  const [draftSecond, setDraftSecond] = useState<number>(parsedCommitted?.second ?? 0);
  const [draftPeriod, setDraftPeriod] = useState<TimePeriod>(() => {
    if (parsedCommitted) {
      return to12Hour(parsedCommitted.hour).period;
    }
    return "AM";
  });

  // Sync draft when popup opens
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (newOpen) {
        if (committedValue) {
          const parsed = temporalToParsed(committedValue);
          setDraftHour(clockFormat === "12h" ? to12Hour(parsed.hour).hour12 : parsed.hour);
          setDraftMinute(parsed.minute);
          setDraftSecond(parsed.second);
          setDraftPeriod(to12Hour(parsed.hour).period);
        } else {
          // Default to current time
          const now = getCurrentTime();
          const currentHour = now.hour;
          setDraftHour(clockFormat === "12h" ? to12Hour(currentHour).hour12 : currentHour);
          setDraftMinute(now.minute);
          setDraftSecond(now.second);
          setDraftPeriod(to12Hour(currentHour).period);
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
    const parsed = getDraftTime();
    const temporalTime = parsedToTemporal(parsed);

    // Check if disabled
    if (isTimeDisabled(temporalTime, temporalMinTime, temporalMaxTime)) {
      return;
    }

    setCommittedValue(temporalTime);
    setOpen(false);
  }, [getDraftTime, temporalMinTime, temporalMaxTime, setCommittedValue]);

  // Cancel changes
  const handleCancel = useCallback(() => {
    setOpen(false);
  }, []);

  // Clear value
  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setCommittedValue(undefined);
    },
    [setCommittedValue]
  );

  // Now button
  const handleNow = useCallback(() => {
    const now = getCurrentTime();
    const currentHour = now.hour;
    setDraftHour(clockFormat === "12h" ? to12Hour(currentHour).hour12 : currentHour);
    setDraftMinute(now.minute);
    setDraftSecond(now.second);
    setDraftPeriod(to12Hour(currentHour).period);
  }, [clockFormat]);

  // Preset selection
  const handlePresetClick = useCallback(
    (preset: TimePresetOption) => {
      const parsed = temporalToParsed(fromISOTime(preset.value));
      setDraftHour(clockFormat === "12h" ? to12Hour(parsed.hour).hour12 : parsed.hour);
      setDraftMinute(parsed.minute);
      setDraftSecond(parsed.second);
      setDraftPeriod(to12Hour(parsed.hour).period);
    },
    [clockFormat]
  );

  // Check if a preset is currently active
  const isPresetActive = useCallback(
    (preset: TimePresetOption): boolean => {
      const draftTime = getDraftTime();
      const presetParsed = temporalToParsed(fromISOTime(preset.value));

      return (
        draftTime.hour === presetParsed.hour && draftTime.minute === presetParsed.minute && (format === "HH:mm" || draftTime.second === presetParsed.second)
      );
    },
    [getDraftTime, format]
  );

  // Floating UI setup
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: handleOpenChange,
    placement: "bottom-end",
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

  // IDs for accessibility
  const id = useId();
  const contentId = `timepicker-content-${id}`;
  const inputId = `timepicker-input-${id}`;

  // Display value
  const displayValue = committedValue ? formatTimeDisplay(committedValue, clockFormat, format) : "";
  const hasValue = Boolean(committedValue);

  // Generate column values
  const hours = generateHours(clockFormat);
  const minutes = generateMinutes(minuteStep);
  const seconds = generateSeconds();

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
            hasValue ? "pr-9" : "pr-3",
            isInvalid && "border-border-danger",
            className
          )}
          {...getReferenceProps()}
        />
        {hasValue && !isDisabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 rounded-sm p-0.5 text-fg-subtle hover:bg-bg-subtle hover:text-fg-normal focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-focus-ring"
            aria-label="Clear time"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Hidden input for form submission */}
        {name && committedValue && <input type="hidden" name={name} value={temporalTimeToISO(committedValue, format)} />}
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
            <div className="flex">
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

              {/* Time Columns */}
              <div className="flex flex-col gap-3">
                {/* Column Headers */}
                <div className="flex items-center justify-center gap-2">
                  <div className="w-14 text-center font-medium text-fg-subtle text-xs">Hour</div>
                  <div className="w-14 text-center font-medium text-fg-subtle text-xs">Min</div>
                  {format === "HH:mm:ss" && <div className="w-14 text-center font-medium text-fg-subtle text-xs">Sec</div>}
                  {clockFormat === "12h" && <div className="w-12 text-center font-medium text-fg-subtle text-xs" />}
                </div>

                {/* Scrollable Columns */}
                <div className="flex items-start gap-2">
                  {/* Hours */}
                  <TimeColumn
                    values={hours}
                    selected={draftHour}
                    onSelect={setDraftHour}
                    formatValue={clockFormat === "12h" ? (v) => String(v) : (v) => String(v).padStart(2, "0")}
                  />

                  {/* Minutes */}
                  <TimeColumn values={minutes} selected={draftMinute} onSelect={setDraftMinute} />

                  {/* Seconds (optional) */}
                  {format === "HH:mm:ss" && <TimeColumn values={seconds} selected={draftSecond} onSelect={setDraftSecond} />}

                  {/* AM/PM (12-hour only) */}
                  {clockFormat === "12h" && <PeriodSelector value={draftPeriod} onChange={setDraftPeriod} />}
                </div>

                <Separator />

                {/* Footer with Now / Cancel / Apply */}
                <div className="flex items-center justify-between">
                  <Button type="button" variant="ghost" size="sm" onClick={handleNow}>
                    Now
                  </Button>
                  <div className="flex gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button type="button" variant="solid" size="sm" onClick={handleApply}>
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  );
};
