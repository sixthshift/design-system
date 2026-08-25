import { useControllableState } from "@sixthshift/design-system/hooks";
import { Label } from "@sixthshift/design-system/label";
import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";

export type CheckboxProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "value"> & {
  /** Controlled checked state */
  checked?: boolean | "indeterminate";
  /** Default checked state for uncontrolled mode */
  defaultChecked?: boolean | "indeterminate";
  /** Called when checked state changes */
  onCheckedChange?: (checked: boolean) => void;
  /** Input name for form submission */
  name?: string;
  /** Value submitted with form (defaults to "on") */
  value?: string;
  /** Label rendered next to the checkbox. Wraps in a <label> for a11y. */
  label?: React.ReactNode;
  /** Classes applied to the wrapping label element when `label` is provided */
  labelClassName?: string;
};

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-3 w-3"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IndeterminateIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    className="h-3 w-3"
    aria-hidden="true"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  (
    {
      className,
      checked: controlledChecked,
      defaultChecked = false,
      onCheckedChange,
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
      onChange: onCheckedChange as ((value: boolean | "indeterminate") => void) | undefined,
    });

    const isChecked = checked === true;
    const isIndeterminate = checked === "indeterminate";

    const button = (
      <>
        {/* biome-ignore lint/a11y/useSemanticElements: Custom checkbox implementation with button role="checkbox" is WAI-ARIA best practice for styled checkboxes */}
        <button
          type="button"
          role="checkbox"
          id={id}
          aria-checked={isIndeterminate ? "mixed" : isChecked}
          data-state={isIndeterminate ? "indeterminate" : isChecked ? "checked" : "unchecked"}
          disabled={disabled}
          ref={ref}
          onClick={() => setChecked(!isChecked)}
          className={cn(
            "peer h-4 w-4 shrink-0 cursor-pointer rounded-xs border border-border-brand shadow focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            (isChecked || isIndeterminate) && "bg-bg-brand text-fg-on-brand",
            className
          )}
          {...props}
        >
          <span className="flex items-center justify-center text-current">
            {isChecked && <CheckIcon />}
            {isIndeterminate && <IndeterminateIcon />}
          </span>
        </button>
        {name && (
          <input
            type="checkbox"
            aria-hidden
            tabIndex={-1}
            name={name}
            value={value}
            checked={isChecked}
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
Checkbox.displayName = "Checkbox";

export { Checkbox };
