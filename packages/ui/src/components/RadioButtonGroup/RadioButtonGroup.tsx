import { useControllableState } from "@sixthshift/ui/hooks";
import { RadioButton } from "@sixthshift/ui/radio-button";
import { cn } from "@sixthshift/ui/utils";
import * as React from "react";

export type RadioButtonGroupOption = {
  /** Unique value for the option */
  value: string;
  /** Display label */
  label: string;
  /** Whether this option is disabled */
  disabled?: boolean;
};

export type RadioButtonGroupProps = Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "onBlur"> & {
  /** Controlled selected value */
  value?: string;
  /** Default selected value for uncontrolled mode */
  defaultValue?: string;
  /** Available options */
  options: readonly RadioButtonGroupOption[];
  /** Called when selection changes */
  onValueChange?: (value: string) => void;
  /** Layout orientation */
  orientation?: "vertical" | "horizontal";
  /** Visual variant */
  variant?: "default" | "button";
  /** Button appearance (only applies when variant="button") */
  appearance?: "segmented" | "separate";
  /** Input name for form submission */
  name?: string;
  /** Disable all options */
  disabled?: boolean;
  /** Called when focus leaves the group entirely */
  onBlur?: () => void;
};

const RadioButtonGroup = React.forwardRef<HTMLDivElement, RadioButtonGroupProps>(
  (
    {
      value: controlledValue,
      defaultValue = "",
      options,
      onValueChange,
      orientation = "vertical",
      variant = "default",
      appearance = "segmented",
      name,
      disabled,
      onBlur,
      className,
      ...props
    },
    ref
  ) => {
    const [value, setValue] = useControllableState({
      value: controlledValue,
      defaultValue,
      onChange: onValueChange,
    });

    const groupRef = React.useRef<HTMLDivElement | null>(null);
    const mergedRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        groupRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      },
      [ref]
    );

    const handleFocusOut = React.useCallback(
      (e: React.FocusEvent) => {
        if (!groupRef.current?.contains(e.relatedTarget as Node)) {
          onBlur?.();
        }
      },
      [onBlur]
    );

    const handleOptionSelect = (optionValue: string) => {
      setValue(optionValue);
    };

    if (variant === "button") {
      const isVertical = orientation === "vertical";
      const isSegmented = appearance === "segmented";

      return (
        <div
          ref={mergedRef}
          role="radiogroup"
          onBlurCapture={handleFocusOut}
          className={cn("inline-flex", isVertical ? "flex-col" : "flex-row", !isSegmented && (isVertical ? "gap-2" : "gap-2"), className)}
          {...props}
        >
          {options.map((option, index) => {
            const isChecked = value === option.value;
            const isDisabled = disabled || option.disabled;
            const isFirst = index === 0;
            const isLast = index === options.length - 1;

            return (
              // biome-ignore lint/a11y/useSemanticElements: Custom radio button group with button role="radio" is WAI-ARIA best practice
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={isChecked}
                disabled={isDisabled}
                onClick={() => handleOptionSelect(option.value)}
                className={cn(
                  "inline-flex items-center justify-center px-4 py-2 font-medium text-sm transition-colors",
                  "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  isSegmented
                    ? cn(
                        "border",
                        isVertical
                          ? cn(isFirst && "rounded-t-md", isLast && "rounded-b-md", !isFirst && "-mt-px")
                          : cn(isFirst && "rounded-l-md", isLast && "rounded-r-md", !isFirst && "-ml-px")
                      )
                    : "rounded-md border",
                  isChecked ? "border-border-brand bg-bg-brand text-fg-on-brand" : "border-border-normal bg-bg-normal text-fg-normal hover:bg-bg-subtle"
                )}
              >
                {option.label}
              </button>
            );
          })}
          {name && <input type="hidden" name={name} value={value} />}
        </div>
      );
    }

    return (
      <div
        ref={mergedRef}
        role="radiogroup"
        onBlurCapture={handleFocusOut}
        className={cn("flex", orientation === "vertical" ? "flex-col gap-3" : "flex-row gap-4", className)}
        {...props}
      >
        {options.map((option) => {
          const isChecked = value === option.value;
          const isDisabled = disabled || option.disabled;

          return (
            <RadioButton
              key={option.value}
              {...(name ? { name } : {})}
              value={option.value}
              checked={isChecked}
              onCheckedChange={() => handleOptionSelect(option.value)}
              disabled={isDisabled}
              label={option.label}
            />
          );
        })}
      </div>
    );
  }
);
RadioButtonGroup.displayName = "RadioButtonGroup";

export { RadioButtonGroup };
