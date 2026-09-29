"use client";

import { useControllableState } from "@sixthshift/design-system/hooks";
import { cn } from "@sixthshift/design-system/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

/**
 * Geometry and behaviour only; every colour reads a `--toggle-*` token decided
 * by src/components/Toggle/toggle.recipe.css.
 *
 * Duplicated from Button on purpose, not shared: a toggle looks like a button
 * but is its own component, so importing Toggle must not pull in Button. The
 * two start identical and are free to drift.
 */
const toggleVariants = cva(
  // One literal, deliberately — see Button.tsx for the sorter trap.
  "toggle border-(color:--toggle-border) focus-visible:ring-(color:--toggle-ring) inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-(--toggle-bg) font-medium text-(--toggle-fg) text-sm transition-colors hover:bg-(--toggle-bg-hovered) focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 active:bg-(--toggle-bg-pressed) disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      size: {
        xs: "h-7 rounded-md px-2 text-xs",
        sm: "h-8 rounded-md px-3 text-xs",
        md: "h-9 px-4 py-2",
        lg: "h-10 rounded-md px-8",
        xl: "h-12 rounded-md px-10 text-base",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

/** The non-colour half of `variant` — border width and elevation. */
const variantStructure: Record<string, string> = {
  solid: "shadow",
  outline: "border shadow-xs",
  ghost: "",
};

/** Squares the box at whatever size is set, and drops the horizontal padding. */
const iconOnlyGeometry: Record<string, string> = {
  xs: "w-7 px-0",
  sm: "w-8 px-0",
  md: "w-9 px-0",
  lg: "w-10 px-0",
  xl: "w-12 px-0",
};

/** Widened deliberately, as on every component: a consumer adds a variant or intent in CSS. */
type Loose<T extends string> = T | (string & {});

export type ToggleVariantName = "solid" | "outline" | "ghost";
export type ToggleIntentName = "neutral" | "brand" | "danger" | "success" | "warning";
export type ToggleVariant = Loose<ToggleVariantName>;
export type ToggleIntent = Loose<ToggleIntentName>;

export type ToggleProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "value"> &
  VariantProps<typeof toggleVariants> & {
    variant?: ToggleVariant | undefined;
    intent?: ToggleIntent | undefined;
    /** Name of a brand the theme defines, rendered as `data-brand`. Omitted, the toggle follows the nearest `data-brand` ancestor. */
    brand?: string | undefined;
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
 * Looks like a Button and takes the same `variant`/`intent`/`size` axes, plus
 * `iconOnly` for a toolbar toggle whose whole content is an icon — but it is
 * its own component, with its own classes and `--toggle-*` tokens, and
 * imports nothing from Button. Every colour, pressed state included, lives in
 * `src/components/Toggle/toggle.recipe.css`, keyed off the `data-state="on" |
 * "off"` attribute this component renders alongside `aria-pressed`.
 *
 * Controlled via `pressed`/`defaultPressed`/`onPressedChange`
 * (`useControllableState`).
 */
const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      className,
      variant = "solid",
      intent = "neutral",
      brand,
      size,
      iconOnly = false,
      pressed: controlledPressed,
      defaultPressed = false,
      onPressedChange,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const [pressed, setPressed] = useControllableState({
      value: controlledPressed,
      defaultValue: defaultPressed,
      onChange: onPressedChange,
    });

    return (
      <button
        type="button"
        aria-pressed={pressed}
        // What the recipe selects on; `data-brand` is omitted unless set.
        data-state={pressed ? "on" : "off"}
        data-variant={variant}
        data-intent={intent}
        data-brand={brand}
        disabled={disabled}
        ref={ref}
        onClick={() => setPressed(!pressed)}
        className={cn(variantStructure[variant], toggleVariants({ size, className: cn(iconOnly ? iconOnlyGeometry[size ?? "md"] : undefined, className) }))}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Toggle.displayName = "Toggle";

export { Toggle, toggleVariants };
