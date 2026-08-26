import { autoUpdate, FloatingPortal, flip, offset, shift, useClick, useDismiss, useFloating, useInteractions } from "@floating-ui/react";
import { useControllableState } from "@sixthshift/design-system/hooks";
import { cn } from "@sixthshift/design-system/utils";
import { Calendar as CalendarIcon, X } from "lucide-react";
import * as React from "react";
import { useCallback, useId, useMemo, useState } from "react";
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
import { CalendarView } from "../Calendar/CalendarView";
import type { PresetOption } from "../Calendar/calendar.types";
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
  } = props;

  // Get mode-specific props
  const value = "value" in props ? props.value : undefined;
  const defaultValue = "defaultValue" in props ? props.defaultValue : undefined;
  const onChange = "onChange" in props ? props.onChange : undefined;
  const max = mode === "multiple" && "max" in props ? props.max : undefined;

  // Open state
  const [open, setOpen] = useState(false);

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

  return (
    <>
      {/* Trigger Input */}
      <div ref={ref} className={cn("relative flex items-center", mode === "range" && "min-w-91.25", mode !== "range" && "min-w-65")}>
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
            `flex h-9 w-full cursor-pointer rounded-md border border-border-normal bg-transparent py-1 pl-9 text-sm shadow-xs transition-colors placeholder:text-fg-subtle focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-focus-ring disabled:cursor-not-allowed disabled:opacity-50`,
            mode === "range" && "min-w-91.25",
            mode !== "range" && "min-w-65",
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
            aria-modal="true"
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
              {...(mode === "multiple" && max ? { max } : {})}
            />
          </div>
        </FloatingPortal>
      )}
    </>
  );
});
DatePicker.displayName = "DatePicker";
