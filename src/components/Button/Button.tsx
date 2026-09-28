import { cn } from "@sixthshift/design-system/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Slot } from "../../internal/Slot";

/**
 * Geometry and behaviour only.
 *
 * Every colour reads a `--button-*` component token whose value is decided by
 * src/components/Button/button.recipe.css. That file is the mapping from
 * `(variant, state)` to the intent slots — the layer that used to be
 * `compoundVariants` here, where it was compiled into class-name literals and
 * unreachable from outside. Nothing in this file names a colour, which is the
 * point: the semantics are now configurable without a release.
 */
const buttonVariants = cva(
  // One literal, deliberately: `useSortedClasses --unsafe` strips the trailing
  // space before a `+`, silently welding the last class of one fragment to the
  // first of the next. The screenshots catch it, but a single string means the
  // sorter has nothing to break.
  "btn border-(color:--button-border) focus-visible:ring-(color:--button-ring) inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-(--button-bg) font-medium text-(--button-fg) text-sm transition-colors hover:bg-(--button-bg-hovered) focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 active:bg-(--button-bg-pressed) disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
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

/**
 * The non-colour half of `variant` — border width, elevation.
 *
 * A plain lookup rather than a CVA variant so an unrecognised variant stays a
 * legal value that contributes no structure, leaving a consumer's CSS free to
 * define it. `intent` needs no equivalent: it was never anything but colour.
 */
const variantStructure: Record<string, string> = {
  solid: "shadow",
  outline: "border shadow-xs",
  ghost: "",
};

/**
 * `inline` — inline text, no button box. Not a variant: it is different
 * geometry, not a quieter fill, so it replaces the box rather than joining the
 * variant axis. The size's text scale stays; its height and padding go.
 */
const inlineGeometry = "h-auto px-0 py-0 underline-offset-4 hover:underline";

/**
 * Squares the box at whatever size is set, and drops the horizontal padding.
 *
 * Shape, kept off the size union deliberately. A single axis carrying both a
 * scale and a shape cannot express a *small* icon button, which is what a fixed
 * `icon: "h-9 w-9"` size amounted to. Keyed by size rather than folded into the
 * size classes so the two stay orthogonal; `cn` (tailwind-merge) resolves
 * `px-0` against the size's own `px-*`, last write winning.
 */
const iconOnlyGeometry: Record<string, string> = {
  xs: "w-7 px-0",
  sm: "w-8 px-0",
  md: "w-9 px-0",
  lg: "w-10 px-0",
  xl: "w-12 px-0",
};

/**
 * Widened deliberately. Adding a variant or an intent is a CSS change in the
 * consuming app, not a release here — so the type has to admit values this file
 * has never heard of, while still autocompleting the ones it ships.
 *
 * The closed unions are exported alongside, because widening a type gives up the
 * ability to narrow it downstream: once `string` is in the union, an `Exclude`
 * can no longer remove anything. Code that must narrow builds on the closed names.
 */
type Loose<T extends string> = T | (string & {});

export type ButtonVariantName = "solid" | "outline" | "ghost";
export type ButtonIntentName = "neutral" | "brand" | "danger" | "success" | "warning";
export type ButtonVariant = Loose<ButtonVariantName>;
export type ButtonIntent = Loose<ButtonIntentName>;

export type ButtonRecipeProps = VariantProps<typeof buttonVariants> & {
  variant?: ButtonVariant | undefined;
  intent?: ButtonIntent | undefined;
  /** Re-points this element's brand tokens to a brand the theme defines. See the Scoped brands docs. */
  brand?: string | undefined;
  iconOnly?: boolean | undefined;
  inline?: boolean | undefined;
  className?: string | undefined;
};

/**
 * The class string plus the attributes the recipe selects on.
 *
 * `data-brand` is only emitted when `brand` is set: `undefined` makes React
 * omit the attribute, so the element takes its brand from its surroundings.
 *
 * Shared with Toggle and ToggleGroupItem, which are built on Button's look. The
 * data attributes are half the contract now, so anything reusing that look has
 * to emit them as well or it lands on the recipe's floor instead of a cell.
 *
 * `inline` is terminal: it drops `data-variant` altogether, so no variant cell
 * can match and the recipe's `[data-inline]` cell decides the colour alone.
 */
export function buttonRecipe({ variant = "solid", intent = "neutral", brand, size, iconOnly = false, inline = false, className }: ButtonRecipeProps) {
  const shape = inline ? inlineGeometry : iconOnly ? iconOnlyGeometry[size ?? "md"] : undefined;
  return {
    className: cn(
      inline ? undefined : variantStructure[variant],
      // `className` stays last so a caller still outranks the shape geometry.
      buttonVariants({ size, className: cn(shape, className) })
    ),
    "data-variant": inline ? undefined : variant,
    "data-inline": inline ? "true" : undefined,
    "data-intent": intent,
    "data-brand": brand,
  };
}

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    variant?: ButtonVariant | undefined;
    intent?: ButtonIntent | undefined;
    /**
     * Name of a brand the theme defines, rendered as `data-brand`. Re-points
     * every brand token on this element, so `intent="brand"` takes that brand's
     * colour. Omitted, the button follows the nearest `data-brand` ancestor.
     */
    brand?: string | undefined;
    /** Square the button at its current size, for an icon with no label. */
    iconOnly?: boolean;
    /** Render as inline text with no button box — a link-styled action. Ignores `variant`. */
    inline?: boolean;
    asChild?: boolean;
    loading?: boolean;
  };

/**
 * A single action the user can take.
 *
 * Appearance is three independent axes, so every combination is expressible:
 * `variant` is the treatment (`solid`, `outline`, `ghost`), `intent` is what
 * the action *means* (`neutral` — the default — plus `brand`, `danger`,
 * `success`, `warning`), and `size` is the height scale. Reach for
 * `intent="danger"` on a destructive action rather than a red `variant` — that
 * is the distinction that keeps "outline danger" possible.
 *
 * `neutral` means *no colour family*: a grey button, the same thing the word
 * means on Badge and Message. A brand-coloured button is
 * `intent="brand"` — an affirmative choice, which is why `neutral` is the
 * default: omitting the prop means "no particular meaning", so it should not
 * quietly hand back the brand colour. A primary action says `intent="brand"`
 * out loud.
 *
 * Colour is not decided here. Each variant resolves through a `--button-*`
 * component token painted from the intent slots, so a consumer can re-point
 * any cell — or add an intent this library never shipped — from their own
 * stylesheet. See the Component tokens story below.
 *
 * `inline` renders the action as inline text with no box — underline on
 * hover, colour from `intent` — for an action that sits in a line of text or a
 * toast. It is terminal: `variant` is ignored.
 *
 * `iconOnly` squares the box at whatever `size` is set and drops the
 * horizontal padding, for a button whose whole content is an icon — give it an
 * `aria-label`, since there is no text to name it. It is a separate prop rather
 * than a size, so `size="sm" iconOnly` is expressible.
 *
 * `brand` scopes the `brand` intent to one of the theme's named brands
 * (`<Button intent="brand" brand="mint">`), for a theme with more than one
 * brand colour. It renders `data-brand` and nothing else; the theme's CSS gives
 * the name meaning, and an unknown name falls back to the surrounding brand.
 *
 * `asChild` renders the child element with Button's styling instead of a
 * `<button>`, for links that should look like buttons. `loading` shows a spinner
 * and disables the control, so it does not need `disabled` as well.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "solid",
      intent = "neutral",
      brand,
      size,
      iconOnly = false,
      inline = false,
      asChild = false,
      loading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp {...buttonRecipe({ variant, intent, brand, size, iconOnly, inline, className })} ref={ref} disabled={disabled || loading} {...props}>
        {loading ? (
          <>
            <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
