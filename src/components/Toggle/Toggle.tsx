import { useControllableState } from "@sixthshift/design-system/hooks";
import { cn } from "@sixthshift/design-system/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { type ButtonIntent, type ButtonVariant, buttonRecipe, type buttonVariants } from "../Button/Button";

/**
 * @deprecated The pressed-state mapping now lives in
 * `src/theme/recipes/toggle.css`, as `.btn[data-state="on"][data-variant=…]
 * [data-intent=…]` cells alongside Button's own recipe. `Toggle` no longer
 * calls this — it relies on the `data-state` attribute it already renders
 * being picked up by those cells — but the export is kept, unchanged, for any
 * external caller still importing it directly.
 */
const togglePressedVariants = cva("", {
  variants: {
    variant: { solid: "", outline: "", ghost: "", link: "" },
    intent: { neutral: "", danger: "", success: "", warning: "" },
  },
  compoundVariants: [
    // Solid — use the main -pressed background
    { variant: "solid", intent: "neutral", className: "bg-bg-brand-pressed hover:bg-bg-brand-pressed" },
    { variant: "solid", intent: "danger", className: "bg-bg-danger-pressed hover:bg-bg-danger-pressed" },
    { variant: "solid", intent: "success", className: "bg-bg-success-pressed hover:bg-bg-success-pressed" },
    { variant: "solid", intent: "warning", className: "bg-bg-warning-pressed hover:bg-bg-warning-pressed" },
    // Outline — use the subtle -pressed background
    { variant: "outline", intent: "neutral", className: "bg-bg-subtle-pressed text-fg-normal hover:bg-bg-subtle-pressed" },
    { variant: "outline", intent: "danger", className: "bg-bg-danger-subtle-pressed text-fg-on-danger-subtle-pressed hover:bg-bg-danger-subtle-pressed" },
    { variant: "outline", intent: "success", className: "bg-bg-success-subtle-pressed text-fg-on-success-subtle-pressed hover:bg-bg-success-subtle-pressed" },
    { variant: "outline", intent: "warning", className: "bg-bg-warning-subtle-pressed text-fg-on-warning-subtle-pressed hover:bg-bg-warning-subtle-pressed" },
    // Ghost — same as outline
    { variant: "ghost", intent: "neutral", className: "bg-bg-subtle-pressed text-fg-normal hover:bg-bg-subtle-pressed" },
    { variant: "ghost", intent: "danger", className: "bg-bg-danger-subtle-pressed text-fg-on-danger-subtle-pressed hover:bg-bg-danger-subtle-pressed" },
    { variant: "ghost", intent: "success", className: "bg-bg-success-subtle-pressed text-fg-on-success-subtle-pressed hover:bg-bg-success-subtle-pressed" },
    { variant: "ghost", intent: "warning", className: "bg-bg-warning-subtle-pressed text-fg-on-warning-subtle-pressed hover:bg-bg-warning-subtle-pressed" },
  ],
  defaultVariants: { variant: "solid", intent: "neutral" },
});

/**
 * `variant` and `intent` are no longer CVA variants on `buttonVariants` — they
 * select a recipe cell in CSS — so they are declared here rather than inherited
 * through `VariantProps`, which now yields `size` alone.
 */
export type ToggleProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "value"> &
  VariantProps<typeof buttonVariants> & {
    variant?: ButtonVariant | undefined;
    intent?: ButtonIntent | undefined;
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
 * Built directly on Button: it calls `buttonRecipe({ variant, intent, size })`
 * and takes the same `variant`/`intent`/`size` axes Button does. The
 * pressed-state colour mapping lives in `src/theme/recipes/toggle.css`,
 * keyed off the `data-state="on" | "off"` attribute this component renders
 * alongside `aria-pressed` — not off `togglePressedVariants`, a CVA export
 * kept only for external callers that still import it directly.
 *
 * Controlled via `pressed`/`defaultPressed`/`onPressedChange`
 * (`useControllableState`).
 */
const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, variant, intent, size, pressed: controlledPressed, defaultPressed = false, onPressedChange, disabled, children, ...props }, ref) => {
    const [pressed, setPressed] = useControllableState({
      value: controlledPressed,
      defaultValue: defaultPressed,
      onChange: onPressedChange,
    });

    const recipe = buttonRecipe({ variant, intent, size });

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

export { Toggle, togglePressedVariants };
