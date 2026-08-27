import { cn } from "@sixthshift/design-system/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Slot } from "../../internal/Slot";

/**
 * Geometry and behaviour only.
 *
 * Every colour reads a `--button-*` component token whose value is decided by
 * src/theme/recipes/button.css. That file is the mapping from
 * `(variant, intent, state)` to a semantic token — the layer that used to be
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
        default: "h-9 px-4 py-2",
        xs: "h-7 rounded-md px-2 text-xs",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        xl: "h-12 rounded-md px-10 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

/**
 * The non-colour half of `variant` — border width, elevation, underline.
 *
 * A plain lookup rather than a CVA variant so an unrecognised variant stays a
 * legal value that contributes no structure, leaving a consumer's CSS free to
 * define it. `intent` needs no equivalent: it was never anything but colour.
 */
const variantStructure: Record<string, string> = {
  solid: "shadow",
  outline: "border shadow-xs",
  ghost: "",
  link: "underline-offset-4 hover:underline",
};

/**
 * Widened deliberately. Adding a variant or an intent is a CSS change in the
 * consuming app, not a release here — so the type has to admit values this file
 * has never heard of, while still autocompleting the ones it ships.
 *
 * The closed unions are exported alongside, because widening a type gives up the
 * ability to narrow it downstream: once `string` is in the union,
 * `Exclude<ButtonVariant, "link">` can no longer remove `link`. ToggleGroup
 * relies on exactly that exclusion, so it builds on the closed names.
 */
type Loose<T extends string> = T | (string & {});

export type ButtonVariantName = "solid" | "outline" | "ghost" | "link";
export type ButtonIntentName = "neutral" | "danger" | "success" | "warning";
export type ButtonVariant = Loose<ButtonVariantName>;
export type ButtonIntent = Loose<ButtonIntentName>;

export type ButtonRecipeProps = VariantProps<typeof buttonVariants> & {
  variant?: ButtonVariant | undefined;
  intent?: ButtonIntent | undefined;
  className?: string | undefined;
};

/**
 * The class string plus the two attributes the recipe selects on.
 *
 * Shared with Toggle and ToggleGroupItem, which are built on Button's look. The
 * data attributes are half the contract now, so anything reusing that look has
 * to emit them as well or it lands on the recipe's floor instead of a cell.
 */
export function buttonRecipe({ variant = "solid", intent = "neutral", size, className }: ButtonRecipeProps) {
  return {
    className: cn(variantStructure[variant], buttonVariants({ size, className })),
    "data-variant": variant,
    "data-intent": intent,
  };
}

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    variant?: ButtonVariant | undefined;
    intent?: ButtonIntent | undefined;
    asChild?: boolean;
    loading?: boolean;
  };

/**
 * A single action the user can take.
 *
 * Appearance is three independent axes, so every combination is expressible:
 * `variant` is the fill and shape (`solid`, `outline`, `ghost`, `link`),
 * `intent` is what the action *means* (`neutral`, `danger`, `success`,
 * `warning`), and `size` is the height scale. Reach for `intent="danger"` on a
 * destructive action rather than a red `variant` — that is the distinction that
 * keeps "outline danger" possible.
 *
 * Colour is not decided here. Each pairing resolves through a `--button-*`
 * component token, so a consumer can re-point any cell — or add an intent this
 * library never shipped — from their own stylesheet. See the Component tokens
 * story below.
 *
 * `asChild` renders the child element with Button's styling instead of a
 * `<button>`, for links that should look like buttons. `loading` shows a spinner
 * and disables the control, so it does not need `disabled` as well.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "solid", intent = "neutral", size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp {...buttonRecipe({ variant, intent, size, className })} ref={ref} disabled={disabled || loading} {...props}>
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
