"use client";

import { useControllableState } from "@sixthshift/design-system/hooks";
import { Label } from "@sixthshift/design-system/label";
import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";

export type SwitchProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "value"> & {
  /** Controlled checked state */
  checked?: boolean;
  /** Default checked state for uncontrolled mode */
  defaultChecked?: boolean;
  /** Called when checked state changes */
  onCheckedChange?: (checked: boolean) => void;
  /** Shows a loading spinner in the thumb and prevents interaction */
  pending?: boolean;
  /** Input name for form submission */
  name?: string;
  /** Value submitted with form (defaults to "on") */
  value?: string;
  /** Label rendered next to the switch. Wraps in a <Label> for a11y. */
  label?: React.ReactNode;
  /** Classes applied to the wrapping element when `label` is provided */
  labelClassName?: string;
};

/**
 * A boolean on/off control rendered as a track with a sliding thumb.
 *
 * Controlled via `checked`/`defaultChecked`/`onCheckedChange`
 * (`useControllableState`). Renders `role="switch"` with `aria-checked`, plus
 * a `data-state="checked" | "unchecked"` attribute the theme recipe
 * (`switch.css`) styles off of.
 *
 * `pending` shows a spinner in the thumb and blocks clicks without disabling
 * the control — it sets `aria-busy` rather than `disabled`, so the switch
 * stays perceivable and focusable while the change is in flight.
 *
 * Pass `label` to wrap the switch in a `<Label>` linked to it by `id`;
 * without one, the caller is responsible for its own accessible name (e.g.
 * `aria-label`). Pass `name` to also render a hidden, read-only checkbox
 * input so the value participates in native form submission (`value`
 * defaults to `"on"`).
 */
const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      className,
      checked: controlledChecked,
      defaultChecked = false,
      onCheckedChange,
      pending = false,
      disabled,
      name,
      value = "on",
      label,
      labelClassName,
      id: idProp,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const id = idProp ?? (label ? generatedId : undefined);

    const [checked, setChecked] = useControllableState({
      value: controlledChecked,
      defaultValue: defaultChecked,
      onChange: onCheckedChange,
    });

    const button = (
      <>
        <button
          type="button"
          role="switch"
          id={id}
          aria-checked={checked}
          aria-busy={pending || undefined}
          data-state={checked ? "checked" : "unchecked"}
          data-pending={pending || undefined}
          disabled={disabled}
          ref={ref}
          onClick={() => !pending && setChecked(!checked)}
          className={cn(
            "switch peer focus-visible:ring-(color:--switch-ring) inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-(--switch-bg) shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-normal disabled:cursor-not-allowed disabled:opacity-50",
            pending && "cursor-default",
            className
          )}
          {...props}
        >
          <span
            className={cn(
              "switch-thumb pointer-events-none flex h-4 w-4 items-center justify-center rounded-full bg-(--switch-thumb-bg) shadow-lg ring-0 transition-transform",
              checked ? "translate-x-4" : "translate-x-0"
            )}
          >
            {pending && (
              <svg
                className="h-2.5 w-2.5 animate-spin text-(--switch-thumb-fg)"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
          </span>
        </button>
        {name && (
          <input
            type="checkbox"
            aria-hidden
            tabIndex={-1}
            name={name}
            value={value}
            checked={checked}
            disabled={disabled}
            readOnly
            style={{
              position: "absolute",
              pointerEvents: "none",
              opacity: 0,
              margin: 0,
              width: 0,
              height: 0,
            }}
          />
        )}
      </>
    );

    if (!label) return button;

    return (
      <div className={cn("flex items-center gap-2", labelClassName)}>
        {button}
        <Label htmlFor={id} className={cn(disabled && "cursor-not-allowed opacity-50")}>
          {label}
        </Label>
      </div>
    );
  }
);
Switch.displayName = "Switch";

export { Switch };
