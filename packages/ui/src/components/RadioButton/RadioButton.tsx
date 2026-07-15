import { Label } from "@sixthshift/ui/label";
import { cn } from "@sixthshift/ui/utils";
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
          onClick={() => onCheckedChange?.(!checked)}
          className={cn(
            "peer h-4 w-4 shrink-0 cursor-pointer rounded-full border border-border-brand shadow focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            checked && "bg-bg-brand text-fg-on-brand",
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
