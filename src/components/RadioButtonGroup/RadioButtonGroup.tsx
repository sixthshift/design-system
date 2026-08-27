import { useControllableState } from "@sixthshift/design-system/hooks";
import { RadioButton } from "@sixthshift/design-system/radio-button";
import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";
import { getRovingTargetIndex } from "../../internal/rovingFocus";
import type { WritableRefObject } from "../../internal/types";

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

/**
 * A set of mutually exclusive radio options sharing one controlled/
 * uncontrolled `string` selection, via the `value`/`defaultValue`/
 * `onValueChange` triad (`useControllableState`).
 *
 * `variant="default"` (the default) renders one `RadioButton` per option.
 * `variant="button"` is a separate rendering path — not a re-skinned
 * `RadioButton` — a row/column of plain buttons with `role="radio"`;
 * contiguous buttons touch and share borders (`appearance="segmented"`, the
 * default) or sit apart with their own rounded corners
 * (`appearance="separate"`).
 *
 * Implements the WAI-ARIA radiogroup keyboard pattern: the group is one tab
 * stop, landing on the checked option (or the first enabled option if none
 * is checked), and arrow/Home/End keys move focus *and* selection between
 * enabled options, wrapping at the ends.
 *
 * Form submission only happens when `name` is set. In the default variant
 * that means each underlying `RadioButton` gets `name`, so one hidden
 * native radio input is rendered per option; in the button variant the
 * group itself renders a single hidden `<input type="hidden">` carrying the
 * selected value.
 *
 * Renders `role="radiogroup"`; focus leaving the whole group — not just
 * moving between options — fires `onBlur`.
 */
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
        else if (ref) (ref as WritableRefObject<HTMLDivElement | null>).current = node;
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

    // A radiogroup is one tab stop with arrow-key navigation; without this each
    // option is separately tabbable, which breaks the WAI-ARIA radio pattern.
    const handleKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
      const enabled = Array.from(groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]') ?? []).filter((radio) => !radio.disabled);
      const focused = (event.target as HTMLElement | null)?.closest?.('[role="radio"]') as HTMLButtonElement | null;
      const target = getRovingTargetIndex(event.key, focused ? enabled.indexOf(focused) : -1, enabled.length);
      if (target === null) return;

      event.preventDefault();
      const next = enabled[target];
      next?.focus();
      // In the radio pattern, moving focus also moves the selection.
      next?.click();
    }, []);

    // The tab stop is the checked option, or the first enabled one when nothing
    // is checked yet, so the group is always reachable by keyboard.
    const firstEnabledValue = options.find((option) => !(disabled || option.disabled))?.value;
    const hasCheckedOption = options.some((option) => option.value === value);
    const tabStopValue = hasCheckedOption ? value : firstEnabledValue;

    if (variant === "button") {
      const isVertical = orientation === "vertical";
      const isSegmented = appearance === "segmented";

      return (
        <div
          ref={mergedRef}
          role="radiogroup"
          onBlurCapture={handleFocusOut}
          onKeyDown={handleKeyDown}
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
                tabIndex={option.value === tabStopValue ? 0 : -1}
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
        onKeyDown={handleKeyDown}
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
              tabIndex={option.value === tabStopValue ? 0 : -1}
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
