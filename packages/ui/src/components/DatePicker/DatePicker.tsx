import { autoUpdate, FloatingPortal, flip, offset, shift, useClick, useDismiss, useFloating, useInteractions } from "@floating-ui/react";
import { isPlainDate, type Temporal, today } from "@sixthshift/temporal";
import { useControllableState } from "@sixthshift/ui/hooks";
import { cn } from "@sixthshift/ui/utils";
import { Calendar as CalendarIcon, X } from "lucide-react";
import type * as React from "react";
import { useCallback, useId, useState } from "react";
import { Calendar } from "../Calendar";
import { defaultFormatDisplay, getDisplayValue, temporalToISO } from "./datepicker.hooks";
import type { DatePickerProps, DateRangeValue } from "./datepicker.types";

export type { DatePickerProps };

export const DatePicker = (props: DatePickerProps) => {
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

  // Controllable value state (external/committed value)
  const [committedValue, setCommittedValue] = useControllableState({
    value: value as Temporal.PlainDate | DateRangeValue | Temporal.PlainDate[] | undefined,
    defaultValue: defaultValue as Temporal.PlainDate | DateRangeValue | Temporal.PlainDate[] | undefined,
    onChange: onChange as ((value: Temporal.PlainDate | DateRangeValue | Temporal.PlainDate[] | undefined) => void) | undefined,
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
      <div className={cn("relative flex items-center", mode === "range" && "min-w-91.25", mode !== "range" && "min-w-65")}>
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
            <Calendar
              mode={mode}
              value={draftValue}
              onSelect={setDraftValue}
              month={month}
              onMonthChange={setMonth}
              minDate={minDate}
              maxDate={maxDate}
              disabled={disabled}
              weekStartsOn={weekStartsOn}
              presets={presets}
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
};
