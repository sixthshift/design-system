import { cn } from "@sixthshift/design-system/utils";
import { X } from "lucide-react";
import * as React from "react";

export type PickerFieldProps = {
  /** The segments, or whatever the field holds. */
  children: React.ReactNode;
  /** Icon for the button that opens the popover — a calendar or a clock. */
  icon: React.ReactNode;
  /** Accessible name for that button, e.g. `"Open calendar for start date"`. */
  toggleLabel: string;
  /**
   * Props for the toggle button — in practice Floating UI's
   * `getReferenceProps()`, spread last so its handlers win.
   */
  toggleProps?: React.ButtonHTMLAttributes<HTMLButtonElement> | undefined;
  /** Drives `aria-expanded` and whether `aria-controls` is set. */
  isOpen: boolean;
  /** Id of the popover this field opens. */
  contentId: string;
  isDisabled?: boolean | undefined;
  isInvalid?: boolean | undefined;
  /** Omit to render no clear button. */
  onClear?: ((event: React.MouseEvent) => void) | undefined;
  /** Accessible name for the clear button, e.g. `"Clear end date"`. */
  clearLabel?: string | undefined;
  className?: string | undefined;
  onFocusCapture?: React.FocusEventHandler<HTMLDivElement> | undefined;
};

/**
 * The bordered box every picker trigger is: an icon button that opens the
 * popover, the field itself, and an optional clear button.
 *
 * Extracted because there were six of these — `DatePicker` alone had three, one
 * per mode plus the two range halves — and they had already started to drift in
 * padding. The field height, the `focus-within` ring, the invalid border and the
 * disabled treatment are decided once here, so changing them is one edit rather
 * than six.
 *
 * Width is deliberately not decided here: a time field is narrower than a
 * date-and-time field, so callers pass their own `min-w-*` through `className`.
 *
 * The ref is the box element — what Floating UI anchors to.
 *
 * Internal. Not exported from the package.
 */
export const PickerField = React.forwardRef<HTMLDivElement, PickerFieldProps>(
  (
    { children, icon, toggleLabel, toggleProps, isOpen, contentId, isDisabled = false, isInvalid = false, onClear, clearLabel, className, onFocusCapture },
    ref
  ) => (
    <div
      ref={ref}
      onFocusCapture={onFocusCapture}
      className={cn(
        "relative flex h-9 items-center gap-1 rounded-md border border-border-normal bg-transparent py-1 pl-1.5 shadow-xs transition-colors focus-within:ring-2 focus-within:ring-focus-ring",
        onClear ? "pr-9" : "pr-3",
        isInvalid && "border-border-danger",
        isDisabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <button
        type="button"
        disabled={isDisabled}
        aria-label={toggleLabel}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? contentId : undefined}
        className="rounded-sm p-1 text-fg-subtle transition-colors hover:text-fg-normal focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-focus-ring disabled:cursor-not-allowed"
        {...toggleProps}
      >
        {icon}
      </button>
      {children}
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label={clearLabel}
          className="absolute right-3 rounded-sm p-0.5 text-fg-subtle hover:bg-bg-subtle hover:text-fg-normal focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
);
PickerField.displayName = "PickerField";
