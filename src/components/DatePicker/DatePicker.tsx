import { autoUpdate, FloatingPortal, flip, offset, shift, useClick, useDismiss, useFloating, useInteractions } from "@floating-ui/react";
import { useControllableState } from "@sixthshift/design-system/hooks";
import { cn } from "@sixthshift/design-system/utils";
import { Calendar as CalendarIcon, X } from "lucide-react";
import * as React from "react";
import { useCallback, useId, useMemo, useRef, useState } from "react";
import {
  adaptDisabledDates,
  fromISODate,
  fromISODateOrUndefined,
  fromISODateRange,
  type ISODate,
  type ISODateRange,
  isPlainDate,
  type Temporal,
  today,
  toISODate,
  toISODateOrUndefined,
  toISODateRange,
} from "../../date-time";
import { PickerField } from "../../internal";
import { CalendarView } from "../Calendar/CalendarView";
import { isDateDisabled } from "../Calendar/calendar.hooks";
import type { PresetOption } from "../Calendar/calendar.types";
import { DateSegments } from "./DateSegments";
import { defaultFormatDisplay, getDisplayValue, temporalToISO } from "./datepicker.hooks";
import type { DatePickerProps, DateRangeValue } from "./datepicker.types";

export type { DatePickerProps };

/** The Temporal-shaped value the picker holds internally, across all modes. */
type InternalValue = Temporal.PlainDate | DateRangeValue | Temporal.PlainDate[] | undefined;

/** Widen a public, mode-appropriate ISO value to {@link InternalValue}. */
function toTemporal(mode: DatePickerProps["mode"], value: ISODate | ISODateRange | ISODate[] | undefined): InternalValue {
  if (mode === "multiple") return ((value as ISODate[] | undefined) ?? []).map(fromISODate);
  if (mode === "range") return fromISODateRange(value as ISODateRange | undefined);
  return fromISODateOrUndefined(value as ISODate | undefined);
}

/**
 * A typeable date field and a `Calendar` popover, as one control. `mode`
 * (`"single" | "range" | "multiple"`, default `"single"`) decides the shape of
 * `value`/`defaultValue`/`onChange`: an `ISODate` string, an `ISODateRange`
 * (`{ from?, to? }`), or an `ISODate[]`.
 *
 * In `single` mode the field is three `role="spinbutton"` segments rather than a
 * text box. It is built to be typed straight through: `152026` is January the
 * 5th 2026, because a digit that cannot extend the segment being typed rolls
 * into the next one instead of restarting it. Separators (`/`, `-`, `.`) say
 * done-with-this-one, arrows step a segment, `Backspace` takes back one digit
 * (then clears, then steps back), `Alt+ArrowDown` opens the grid and moves focus
 * there, and a paste fills all three. Segments rather than free
 * text because `08/09` cannot be read without knowing the order: `segmentOrder`
 * (default `mdy`) says which, the labels say it to a screen reader, and no
 * parser has to guess. `range` and `multiple` keep the read-only text trigger —
 * a list of dates has no sensible typed form.
 *
 * Typing and picking move one value. The segments show the draft while the
 * popover is open and the committed value while it is closed, so typing a date
 * moves the grid to it and picking a day shows up in the segments. The commit
 * contract stays single: while the popover is open its Apply/Cancel owns the
 * value (`Enter` in a segment is Apply); while it is closed, a date commits as
 * soon as all three segments describe one. A partial date is never reported —
 * clearing a segment reports `undefined`.
 *
 * Supports both controlled (`value`/`onChange`) and uncontrolled
 * (`defaultValue`) use. Opening the popover seeds a draft from the committed
 * value; picking a date only updates the draft; the footer's Apply commits it
 * and closes, Cancel discards it and reverts to the last committed value. The
 * clear button (hidden when `clearable={false}`) bypasses the draft and
 * commits immediately.
 *
 * `minDate`/`maxDate` bound selectable dates inclusively; `disabled` accepts a
 * single date, a list, or a declarative matcher (before/after/range/weekday)
 * or predicate — see `DisabledDates`. `presets` renders a sidebar of quick
 * picks whose values must match `mode`. When `name` is set, the committed
 * value is mirrored into hidden `<input>`s for native form submission
 * (`name.from`/`name.to` in range mode, `name[]` per entry in multiple mode).
 *
 * Keyboard interaction — arrow keys/Home/End/PageUp/PageDown on the day
 * grid — is inherited from `Calendar`.
 */
export const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>((props, ref) => {
  const {
    mode = "single",
    weekStartsOn = 0,
    minDate,
    maxDate,
    disabled,
    presets,
    placeholder = "Select date",
    isDisabled = false,
    isInvalid = false,
    name,
    className,
    align = "end",
    clearable = true,
    segmentOrder = "mdy",
  } = props;

  // Get mode-specific props
  const value = "value" in props ? props.value : undefined;
  const defaultValue = "defaultValue" in props ? props.defaultValue : undefined;
  const onChange = "onChange" in props ? props.onChange : undefined;
  const max = mode === "multiple" && "max" in props ? props.max : undefined;

  // Open state
  const [open, setOpen] = useState(false);
  // Whether the day grid should take focus when the popover mounts — true only
  // when the popover was opened from the keyboard. See `openWithGridFocus`.
  const [autoFocusDay, setAutoFocusDay] = useState(false);

  // ---------------------------------------------------------------------------
  // The ISO boundary.
  //
  // Props arrive as canonical ISO strings and callbacks emit them; everything
  // below this block — state, the calendar grid, display formatting — works in
  // Temporal, exactly as before.
  //
  // Each conversion is memoised on the string it derives from. Temporal values
  // have no value identity, so converting unmemoised would hand CalendarView a
  // fresh object every render and invalidate its grid memos. Strings compare by
  // value, which makes this strictly more stable than passing Temporal in.
  // ---------------------------------------------------------------------------

  const temporalMinDate = useMemo(() => fromISODateOrUndefined(minDate), [minDate]);
  const temporalMaxDate = useMemo(() => fromISODateOrUndefined(maxDate), [maxDate]);
  const temporalDisabled = useMemo(() => adaptDisabledDates(disabled), [disabled]);

  const temporalPresets = useMemo(() => {
    if (!presets) return undefined;
    if (mode === "single") {
      return (presets as PresetOption<ISODate>[]).map((preset) => ({ label: preset.label, value: fromISODate(preset.value) }));
    }
    if (mode === "multiple") {
      return (presets as PresetOption<ISODate[]>[]).map((preset) => ({ label: preset.label, value: preset.value.map(fromISODate) }));
    }
    return (presets as PresetOption<ISODateRange>[]).map((preset) => ({
      label: preset.label,
      value: fromISODateRange(preset.value) ?? { from: undefined, to: undefined },
    }));
  }, [mode, presets]);

  const temporalValue = useMemo(() => toTemporal(mode, value), [mode, value]);
  // Read once, on mount, by useControllableState's useState initialiser.
  const temporalDefaultValue = useMemo(() => toTemporal(mode, defaultValue), [mode, defaultValue]);

  const handleChange = useCallback(
    (next: InternalValue) => {
      if (!onChange) return;
      if (mode === "single") {
        (onChange as (date: ISODate | undefined) => void)(toISODateOrUndefined(next as Temporal.PlainDate | undefined));
        return;
      }
      if (mode === "multiple") {
        (onChange as (dates: ISODate[]) => void)(((next as Temporal.PlainDate[] | undefined) ?? []).map(toISODate));
        return;
      }
      (onChange as (range: ISODateRange | undefined) => void)(toISODateRange(next as DateRangeValue | undefined));
    },
    [mode, onChange]
  );

  // Controllable value state (external/committed value)
  const [committedValue, setCommittedValue] = useControllableState<InternalValue>({
    value: temporalValue,
    defaultValue: temporalDefaultValue,
    onChange: handleChange,
  });

  // Draft value (internal state while popup is open)
  const [draftValue, setDraftValue] = useState<Temporal.PlainDate | DateRangeValue | Temporal.PlainDate[] | undefined>(committedValue);

  // Sync draft when popup opens
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (newOpen) {
        setDraftValue(committedValue);
      } else {
        setAutoFocusDay(false);
      }
      setOpen(newOpen);
    },
    [committedValue]
  );

  // Month navigation state (uses Temporal.PlainDate for calendar grid)
  const [month, setMonth] = useState<Temporal.PlainDate>(() => {
    if (mode === "single" && isPlainDate(committedValue)) {
      return committedValue;
    }
    if (mode === "range" && committedValue && typeof committedValue === "object" && "from" in committedValue && committedValue.from) {
      return committedValue.from;
    }
    if (mode === "multiple" && Array.isArray(committedValue) && committedValue.length > 0 && committedValue[0]) {
      return committedValue[0];
    }
    return today();
  });

  // Apply changes
  const handleApply = useCallback(() => {
    setCommittedValue(draftValue as Temporal.PlainDate | DateRangeValue | Temporal.PlainDate[]);
    setOpen(false);
  }, [draftValue, setCommittedValue]);

  // Cancel changes
  const handleCancel = useCallback(() => {
    setDraftValue(committedValue);
    setOpen(false);
  }, [committedValue]);

  // Clear value
  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (mode === "multiple") {
        setCommittedValue([] as unknown as Temporal.PlainDate | DateRangeValue | Temporal.PlainDate[]);
      } else {
        setCommittedValue(undefined);
      }
    },
    [mode, setCommittedValue]
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
  const contentId = `datepicker-content-${id}`;
  const inputId = `datepicker-input-${id}`;

  // Display value (from committed value)
  const displayValue = getDisplayValue(mode, committedValue, defaultFormatDisplay);
  const hasValue = mode === "multiple" ? Array.isArray(committedValue) && committedValue.length > 0 : Boolean(committedValue);

  // Helper to get ISO string for form submission
  const getFormValue = (): string | undefined => {
    if (mode === "single" && isPlainDate(committedValue)) {
      return temporalToISO(committedValue);
    }
    return undefined;
  };

  const getRangeFormValues = (): {
    from: string | undefined;
    to: string | undefined;
  } => {
    if (mode === "range" && committedValue) {
      const range = committedValue as DateRangeValue;
      return {
        from: range.from ? temporalToISO(range.from) : undefined,
        to: range.to ? temporalToISO(range.to) : undefined,
      };
    }
    return { from: undefined, to: undefined };
  };

  const rangeFormValues = getRangeFormValues();

  // ---------------------------------------------------------------------------
  // The typeable field (single mode).
  //
  // One value, two ways to move it. The segments show the draft while the
  // popover is open and the committed value while it is closed, which is what
  // makes typing and clicking feel like one control: type a date and the grid
  // follows it, click a day and the segments follow that. The commit contract
  // stays single — open means the popover's Apply/Cancel owns it, closed means a
  // complete date commits as soon as it is complete.
  // ---------------------------------------------------------------------------

  const segmentSource = open ? draftValue : committedValue;
  const segmentValue = isPlainDate(segmentSource) ? segmentSource : undefined;

  /**
   * A typed date can be one the grid would refuse — nothing stops you typing
   * past `maxDate`. Rather than silently clamping it (which loses what was
   * typed) or refusing it (which strands the field mid-edit), the field says so:
   * `aria-invalid` and the danger border, with the value still reported so the
   * caller's own validation sees the attempt.
   */
  const outOfBounds = useCallback(
    (date: Temporal.PlainDate | undefined) => date !== undefined && isDateDisabled(date, temporalDisabled, temporalMinDate, temporalMaxDate),
    [temporalDisabled, temporalMaxDate, temporalMinDate]
  );

  const handleSegmentsChange = useCallback(
    (date: Temporal.PlainDate | undefined) => {
      // Keep the grid on the month being typed, so opening it lands where the
      // user already is rather than on today.
      if (date) setMonth(date);
      if (open) {
        setDraftValue(date);
        return;
      }
      setCommittedValue(date as Temporal.PlainDate | DateRangeValue | Temporal.PlainDate[]);
    },
    [open, setCommittedValue]
  );

  /** `Alt+ArrowDown` from a segment: open the grid *and* go there. */
  const openWithGridFocus = useCallback(() => {
    setAutoFocusDay(true);
    handleOpenChange(true);
  }, [handleOpenChange]);

  /** `Enter` in a segment commits the draft, matching the popover's Apply. */
  const handleFieldSubmit = useCallback(() => {
    if (open) handleApply();
  }, [handleApply, open]);

  // ---------------------------------------------------------------------------
  // Range mode: two fields, not one.
  //
  // A range is two dates, and typing one of them should not require knowing
  // where the other ends. Each half is its own segmented field with its own
  // clear button; they share the one popover, which anchors to whichever half
  // you are in so it opens under the date you are editing.
  // ---------------------------------------------------------------------------

  const rangeSource = (open ? draftValue : committedValue) as DateRangeValue | undefined;

  const setRangeEnd = useCallback(
    (end: "from" | "to", date: Temporal.PlainDate | undefined) => {
      if (date) setMonth(date);
      const current = (open ? draftValue : committedValue) as DateRangeValue | undefined;
      const next: DateRangeValue = { from: current?.from, to: current?.to, [end]: date };
      if (open) {
        setDraftValue(next);
        return;
      }
      setCommittedValue(next as Temporal.PlainDate | DateRangeValue | Temporal.PlainDate[]);
    },
    [committedValue, draftValue, open, setCommittedValue]
  );

  const clearRangeEnd = useCallback(
    (end: "from" | "to") => (event: React.MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      const existing = committedValue as DateRangeValue | undefined;
      const next: DateRangeValue = {
        from: end === "from" ? undefined : existing?.from,
        to: end === "to" ? undefined : existing?.to,
      };
      // Clearing the last remaining end clears the range itself, so a consumer
      // gets `undefined` rather than a husk with two empty ends.
      const cleared = !next.from && !next.to;
      setCommittedValue((cleared ? undefined : next) as Temporal.PlainDate | DateRangeValue | Temporal.PlainDate[]);
    },
    [committedValue, setCommittedValue]
  );

  // The popover anchors to the half being edited, so it opens under the date in
  // question rather than under the middle of a wide trigger.
  const rangeHalves = useRef<Record<"from" | "to", HTMLDivElement | null>>({ from: null, to: null });
  const anchorToHalf = useCallback(
    (end: "from" | "to") => {
      const node = rangeHalves.current[end];
      if (node) refs.setPositionReference(node);
    },
    [refs]
  );

  /**
   * One end of the range. A render function rather than a component so the
   * fields are not remounted — and so focus is not dropped — on every keystroke.
   */
  const renderRangeHalf = (end: "from" | "to", label: string) => {
    const shown = end === "from" ? rangeSource?.from : rangeSource?.to;
    const settled = end === "from" ? (committedValue as DateRangeValue | undefined)?.from : (committedValue as DateRangeValue | undefined)?.to;

    return (
      <PickerField
        ref={(node) => {
          rangeHalves.current[end] = node;
        }}
        onFocusCapture={() => anchorToHalf(end)}
        className="min-w-45 flex-1"
        icon={<CalendarIcon className="h-4 w-4" />}
        toggleLabel={`Open calendar for ${label.toLowerCase()}`}
        // Both handlers have to run: Floating UI's opens the popover, and ours
        // points it at this half. Spreading after `onClick` would drop ours on
        // the floor, which is how the popover ended up anchored to the whole
        // trigger.
        toggleProps={getReferenceProps({ onClick: () => anchorToHalf(end) })}
        isOpen={open}
        contentId={contentId}
        isDisabled={isDisabled}
        isInvalid={isInvalid || outOfBounds(shown)}
        onClear={clearable && settled && !isDisabled ? clearRangeEnd(end) : undefined}
        clearLabel={`Clear ${label.toLowerCase()}`}
      >
        <DateSegments
          className="h-full flex-1"
          label={label}
          value={shown}
          onChange={(date) => setRangeEnd(end, date)}
          order={segmentOrder}
          isDisabled={isDisabled}
          isInvalid={isInvalid || outOfBounds(shown)}
          onOpenRequest={() => {
            anchorToHalf(end);
            openWithGridFocus();
          }}
          onSubmit={handleFieldSubmit}
        />
      </PickerField>
    );
  };

  return (
    <>
      {/* Trigger Input */}
      <div
        ref={(node) => {
          // The container is the interaction reference, so a click in either
          // range half counts as inside; range mode then re-points the
          // *position* reference at the half being edited.
          refs.setReference(node);
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={cn("relative flex items-center gap-2", mode === "range" && "min-w-91.25", mode !== "range" && "min-w-65")}
      >
        {mode === "range" ? (
          <>
            {renderRangeHalf("from", "Start date")}
            <span aria-hidden="true" className="text-fg-subtle">
              –
            </span>
            {renderRangeHalf("to", "End date")}
          </>
        ) : mode === "single" ? (
          <PickerField
            className={cn("w-full min-w-65", className)}
            icon={<CalendarIcon className="h-4 w-4" />}
            toggleLabel="Open calendar"
            toggleProps={getReferenceProps()}
            isOpen={open}
            contentId={contentId}
            isDisabled={isDisabled}
            isInvalid={isInvalid || outOfBounds(segmentValue)}
            onClear={clearable && hasValue && !isDisabled ? handleClear : undefined}
            clearLabel="Clear date"
          >
            <DateSegments
              className="h-full flex-1"
              id={inputId}
              value={segmentValue}
              onChange={handleSegmentsChange}
              order={segmentOrder}
              isDisabled={isDisabled}
              isInvalid={isInvalid || outOfBounds(segmentValue)}
              onOpenRequest={openWithGridFocus}
              onSubmit={handleFieldSubmit}
            />
          </PickerField>
        ) : (
          <>
            <CalendarIcon className="pointer-events-none absolute left-3 h-4 w-4 text-fg-subtle" />
            <input
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
                "min-w-65",
                clearable && hasValue ? "pr-9" : "pr-3",
                isInvalid && "border-border-danger",
                className
              )}
              {...getReferenceProps()}
            />
          </>
        )}
        {/* `multiple` mode still uses the read-only input, so its clear button
            stays here; the other two modes get theirs from `PickerField`. */}
        {clearable && hasValue && !isDisabled && mode === "multiple" && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 rounded-sm p-0.5 text-fg-subtle hover:bg-bg-subtle hover:text-fg-normal focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-focus-ring"
            aria-label="Clear date"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Hidden inputs for form submission */}
        {name && mode === "single" && committedValue && <input type="hidden" name={name} value={getFormValue()} />}
        {name && mode === "range" && committedValue && (
          <>
            {rangeFormValues.from && <input type="hidden" name={`${name}.from`} value={rangeFormValues.from} />}
            {rangeFormValues.to && <input type="hidden" name={`${name}.to`} value={rangeFormValues.to} />}
          </>
        )}
        {name &&
          mode === "multiple" &&
          Array.isArray(committedValue) &&
          // biome-ignore lint/suspicious/noArrayIndexKey: Hidden form inputs for stable date array
          committedValue.map((date, i) => <input key={i} type="hidden" name={`${name}[]`} value={temporalToISO(date)} />)}
      </div>

      {/* Popover Content */}
      {open && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            id={contentId}
            role="dialog"
            aria-label="Choose date"
            style={floatingStyles}
            className="z-popover rounded-xl border border-border-normal bg-bg-normal p-4 shadow-lg"
            {...getFloatingProps()}
          >
            {/* @ts-expect-error - TypeScript can't properly narrow discriminated union props across component boundaries */}
            <CalendarView
              mode={mode}
              value={draftValue}
              onSelect={setDraftValue}
              month={month}
              onMonthChange={setMonth}
              minDate={temporalMinDate}
              maxDate={temporalMaxDate}
              disabled={temporalDisabled}
              weekStartsOn={weekStartsOn}
              presets={temporalPresets}
              showFooter
              showToday={mode !== "range"}
              onApply={handleApply}
              onCancel={handleCancel}
              autoFocusDay={autoFocusDay}
              {...(mode === "multiple" && max ? { max } : {})}
            />
          </div>
        </FloatingPortal>
      )}
    </>
  );
});
DatePicker.displayName = "DatePicker";
