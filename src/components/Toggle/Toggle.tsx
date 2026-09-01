"use client";

import { useControllableState } from "@sixthshift/design-system/hooks";
import { cn } from "@sixthshift/design-system/utils";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { type ButtonIntent, type ButtonVariant, buttonRecipe, type buttonVariants } from "../Button/Button";

/**
 * `variant` and `intent` are no longer CVA variants on `buttonVariants` — they
 * select a recipe cell in CSS — so they are declared here rather than inherited
 * through `VariantProps`, which now yields `size` alone.
 */
export type ToggleProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "value"> &
  VariantProps<typeof buttonVariants> & {
    variant?: ButtonVariant | undefined;
    intent?: ButtonIntent | undefined;
    /** Square the toggle at its current size, for an icon with no label. */
    iconOnly?: boolean;
    /** Controlled pressed state */
    pressed?: boolean;
    /** Default pressed state for uncontrolled mode */
    defaultPressed?: boolean;
    /** Called when pressed state changes */
    onPressedChange?: (pressed: boolean) => void;
  };

/**
 * A single button that toggles between pressed and unpressed, for a binary
 * setting styled like an action (e.g. a bold/italic button in a toolbar) —
 * for a set of mutually exclusive or multi-select options, use `ToggleGroup`
 * instead.
 *
 * Built directly on Button: it calls `buttonRecipe(...)` and takes the same
 * `variant`/`intent`/`size` axes Button does, plus `iconOnly` for a toolbar
 * toggle whose whole content is an icon. The
 * pressed-state colour mapping lives in `src/components/Toggle/toggle.recipe.css`,
 * keyed off the `data-state="on" | "off"` attribute this component renders
 * alongside `aria-pressed`.
 *
 * Controlled via `pressed`/`defaultPressed`/`onPressedChange`
 * (`useControllableState`).
 */
const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  (
    { className, variant, intent, size, iconOnly = false, pressed: controlledPressed, defaultPressed = false, onPressedChange, disabled, children, ...props },
    ref
  ) => {
    const [pressed, setPressed] = useControllableState({
      value: controlledPressed,
      defaultValue: defaultPressed,
      onChange: onPressedChange,
    });

    const recipe = buttonRecipe({ variant, intent, size, iconOnly });

    return (
      <button
        type="button"
        aria-pressed={pressed}
        data-state={pressed ? "on" : "off"}
        disabled={disabled}
        ref={ref}
        onClick={() => setPressed(!pressed)}
        {...recipe}
        className={cn(recipe.className, className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Toggle.displayName = "Toggle";

export { Toggle };
