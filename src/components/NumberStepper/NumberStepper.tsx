"use client";

import { useControllableState } from "@sixthshift/design-system/hooks";
import { cn } from "@sixthshift/design-system/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Minus, Plus } from "lucide-react";
import * as React from "react";

/**
 * Geometry only. Every colour reads a `--number-stepper-*` component token
 * whose value is decided by src/components/NumberStepper/number-stepper.recipe.css.
 *
 * `size` tracks Input's and Button's heights (`sm` 32px, `md` 36px, `lg`
 * 40px) so a stepper sits on the same baseline as the fields beside it.
 */
const numberStepperVariants = cva(
  // One literal, deliberately — see Button.tsx for why a `+` concatenation is a trap.
  "number-stepper border-(color:--number-stepper-border) focus-within:ring-(color:--number-stepper-ring) inline-flex w-fit items-stretch overflow-hidden rounded-md border bg-(--number-stepper-bg) text-(--number-stepper-fg) shadow-xs transition-colors focus-within:ring-2 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50",
  {
    variants: {
      size: {
        sm: "h-8 text-xs [&_svg]:size-3.5",
        md: "h-9 text-sm [&_svg]:size-4",
        lg: "h-10 text-sm [&_svg]:size-4",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

/** Button width per size — square against the field's height. */
const buttonGeometry: Record<string, string> = {
  sm: "w-8",
  md: "w-9",
  lg: "w-10",
};

/** Input width per size — room for three digits before it grows. */
const inputGeometry: Record<string, string> = {
  sm: "w-10",
  md: "w-12",
  lg: "w-14",
};

export type NumberStepperSize = NonNullable<VariantProps<typeof numberStepperVariants>["size"]>;

export type NumberStepperProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "size" | "min" | "max" | "step" | "type"
> &
  VariantProps<typeof numberStepperVariants> & {
    /** Controlled value. */
    value?: number;
    /** Initial value in uncontrolled mode. Defaults to `min`, or `0` without one. */
    defaultValue?: number;
    /** Called with the new, already-clamped value. */
    onValueChange?: (value: number) => void;
    /** Lowest reachable value. Defaults to `0` — quantities are the common case. */
    min?: number;
    /** Highest reachable value. Unbounded when omitted. */
    max?: number;
    /** Increment for the buttons and arrow keys. `PageUp`/`PageDown` move ten of them. */
    step?: number;
    /** Accessible name for the decrement button. */
    decrementLabel?: string;
    /** Accessible name for the increment button. */
    incrementLabel?: string;
    /** Extra classes for the inner `<input>`; `className` styles the surrounding group. */
    inputClassName?: string;
  };

function clamp(value: number, min: number, max: number | undefined): number {
  const floored = Math.max(min, value);
  return max === undefined ? floored : Math.min(max, floored);
}

/**
 * A whole-number field with decrement and increment buttons — a cart
 * quantity, a guest count, a per-day capacity.
 *
 * Implements the WAI-ARIA spinbutton pattern on the `<input>` itself:
 * `role="spinbutton"` with `aria-valuenow`/`min`/`max`, `ArrowUp`/`ArrowDown`
 * step, `PageUp`/`PageDown` step by ten, and `Home`/`End` jump to the bounds
 * that exist. The two buttons are pointer affordances and stay out of the tab
 * order, so the field is one tab stop — the same reason RadioButtonGroup is.
 *
 * Typing is free-form while focused and committed on blur or `Enter`: the
 * draft is parsed, rounded to the nearest `step` from `min`, and clamped.
 * Anything unparseable reverts to the last committed value rather than
 * reporting `NaN`. Every value `onValueChange` receives is in range.
 *
 * Controlled or uncontrolled through the `value`/`defaultValue`/
 * `onValueChange` triad. `name` submits the committed value with a form, since
 * the input is a real `<input>`. The ref and every unlisted prop land on that
 * input — so `FormField`'s `id`/`aria-describedby` wiring reaches the control
 * — while `className` styles the surrounding group.
 */
export const NumberStepper = React.forwardRef<HTMLInputElement, NumberStepperProps>(
  (
    {
      className,
      inputClassName,
      size = "md",
      value: controlledValue,
      defaultValue,
      onValueChange,
      min = 0,
      max,
      step = 1,
      disabled = false,
      readOnly = false,
      decrementLabel = "Decrease",
      incrementLabel = "Increase",
      onKeyDown,
      onBlur,
      onFocus,
      ...props
    },
    ref
  ) => {
    const [value, setValue] = useControllableState({
      value: controlledValue,
      defaultValue: clamp(defaultValue ?? min, min, max),
      onChange: onValueChange,
    });

    // The text being typed, or `null` when the field shows the committed value.
    const [draft, setDraft] = React.useState<string | null>(null);

    const commit = (next: number) => {
      const snapped = min + Math.round((next - min) / step) * step;
      const clamped = clamp(snapped, min, max);
      if (clamped !== value) setValue(clamped);
    };

    const commitDraft = () => {
      if (draft === null) return;
      const parsed = Number.parseFloat(draft);
      setDraft(null);
      if (Number.isFinite(parsed)) commit(parsed);
    };

    const interactive = !disabled && !readOnly;
    const atMin = value <= min;
    const atMax = max !== undefined && value >= max;

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || !interactive) return;

      const moves: Record<string, (() => number) | undefined> = {
        ArrowUp: () => value + step,
        ArrowDown: () => value - step,
        PageUp: () => value + step * 10,
        PageDown: () => value - step * 10,
        Home: () => min,
        End: max === undefined ? undefined : () => max,
      };
      const move = moves[event.key];

      if (event.key === "Enter") {
        commitDraft();
        return;
      }
      if (!move) return;

      event.preventDefault();
      setDraft(null);
      commit(move());
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      commitDraft();
      onBlur?.(event);
    };

    const stepBy = (direction: 1 | -1) => {
      setDraft(null);
      commit(value + step * direction);
    };

    const buttonClass = cn(
      "number-stepper-button flex shrink-0 cursor-pointer items-center justify-center text-(--number-stepper-button-fg) transition-colors enabled:active:bg-(--number-stepper-button-bg-pressed) enabled:hover:bg-(--number-stepper-button-bg-hovered) disabled:cursor-not-allowed disabled:text-(--number-stepper-button-fg-disabled)",
      buttonGeometry[size ?? "md"]
    );

    return (
      // biome-ignore lint/a11y/useSemanticElements: a <fieldset> brings a border, min-width and legend semantics this inline control does not want; role="group" only ties the buttons to the field
      <div role="group" data-disabled={disabled} className={numberStepperVariants({ size, className })}>
        <button type="button" tabIndex={-1} aria-label={decrementLabel} disabled={!interactive || atMin} onClick={() => stepBy(-1)} className={buttonClass}>
          <Minus aria-hidden="true" />
        </button>
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          role="spinbutton"
          autoComplete="off"
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          disabled={disabled}
          readOnly={readOnly}
          value={draft ?? String(value)}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={onFocus}
          className={cn(
            "border-(color:--number-stepper-divider-border) min-w-0 border-x bg-transparent text-center text-[length:inherit] tabular-nums outline-hidden disabled:cursor-not-allowed",
            inputGeometry[size ?? "md"],
            inputClassName
          )}
          {...props}
        />
        <button type="button" tabIndex={-1} aria-label={incrementLabel} disabled={!interactive || atMax} onClick={() => stepBy(1)} className={buttonClass}>
          <Plus aria-hidden="true" />
        </button>
      </div>
    );
  }
);
NumberStepper.displayName = "NumberStepper";

export { numberStepperVariants };
