"use client";

import { Label } from "@sixthshift/design-system/label";
import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";

export type RadioButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "value"> & {
  /** Whether the radio button is selected */
  checked?: boolean;
  /** Callback when selection changes */
  onCheckedChange?: (checked: boolean) => void;
  /** Input name for form submission (groups radio buttons together) */
  name?: string;
  /** Value submitted with form (defaults to "on") */
  value?: string;
  /** Label rendered next to the radio button. Wraps in a <Label> for a11y. */
  label?: React.ReactNode;
  /** Classes applied to the wrapping element when `label` is provided */
  labelClassName?: string;
};

const RadioButtonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-2 w-2" aria-hidden="true">
    <circle cx="12" cy="12" r="6" />
  </svg>
);

/**
 * A single custom radio option — a button with `role="radio"` rather than
 * a native `<input type="radio">`, so it can be styled without fighting
 * native radio rendering.
 *
 * Unlike `Checkbox`, it holds no internal state: `checked` is a plain
 * controlled prop (default `false`, no `defaultChecked`), and clicking an
 * unselected radio calls `onCheckedChange(true)` — the caller owns tracking
 * which option in a group is selected. In practice that means using
 * `RadioButtonGroup` to manage a group's value, or wiring up the shared
 * selection by hand.
 *
 * Clicking an already-selected radio does nothing and reports nothing: a radio
 * is not a toggle, and the way to deselect one is to select a sibling. That
 * makes `onCheckedChange` a one-way signal — it is only ever called with
 * `true`.
 *
 * Only participates in native form submission when `name` is set, via a
 * hidden native `<input type="radio">` rendered alongside the button and
 * kept in sync (`value` defaults to `"on"`); give every radio in a group the
 * same `name` to group them for native submission.
 *
 * Passing `label` wraps the button and a `<Label>` together and wires
 * `htmlFor`/`id` between them; without it, you get just the button and must
 * supply your own accessible name.
 */
const RadioButton = React.forwardRef<HTMLButtonElement, RadioButtonProps>(
  ({ className, checked = false, onCheckedChange, disabled, name, value = "on", label, labelClassName, id: idProp, ...props }, ref) => {
    const generatedId = React.useId();
    const id = idProp ?? (label ? generatedId : undefined);

    const button = (
      <>
        {/* biome-ignore lint/a11y/useSemanticElements: Custom radio button with button role="radio" is WAI-ARIA best practice for styled radio buttons */}
        <button
          type="button"
          role="radio"
          id={id}
          aria-checked={checked}
          data-state={checked ? "checked" : "unchecked"}
          disabled={disabled}
          ref={ref}
          // A radio is not a toggle: activating the selected option leaves it
          // selected, and reports nothing, so a caller holding the selection
          // does not see a spurious change. Deselection happens by selecting a
          // sibling, which is what `RadioButtonGroup` does.
          onClick={() => {
            if (!checked) onCheckedChange?.(true);
          }}
          className={cn(
            "radio-button peer border-(color:--radio-button-border) focus-visible:ring-(color:--radio-button-ring) h-4 w-4 shrink-0 cursor-pointer rounded-full border bg-(--radio-button-bg) text-(--radio-button-fg) shadow focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        >
          <span className="flex items-center justify-center text-current">{checked && <RadioButtonIcon />}</span>
        </button>
        {name && (
          <input
            type="radio"
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
RadioButton.displayName = "RadioButton";

export { RadioButton };
