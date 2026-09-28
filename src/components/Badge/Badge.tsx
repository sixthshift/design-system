import { cn } from "@sixthshift/design-system/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

/**
 * Geometry and behaviour only.
 *
 * Every colour reads a `--badge-*` component token whose value is decided by
 * src/components/Badge/badge.recipe.css. That file is the mapping from
 * `variant` to the intent slots — the layer that used to be
 * `compoundVariants` here, where it was compiled into class-name literals and
 * unreachable from outside. Nothing in this file names a colour, which is the
 * point: the semantics are now configurable without a release.
 */
const badgeVariants = cva(
  // One literal, deliberately: `useSortedClasses --unsafe` strips the trailing
  // space before a `+`, silently welding the last class of one fragment to the
  // first of the next. The screenshots catch it, but a single string means the
  // sorter has nothing to break.
  "badge border-(color:--badge-border) focus:ring-(color:--badge-ring) inline-flex items-center rounded-md border bg-(--badge-bg) font-semibold text-(--badge-fg) transition-colors focus:outline-hidden focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      size: {
        sm: "px-1.5 py-0 text-[10px]",
        md: "px-2.5 py-0.5 text-xs",
      },
    },
    defaultVariants: { size: "md" },
  }
);

/**
 * The non-colour half of `variant` — elevation only, for Badge. A plain
 * lookup rather than a CVA variant so an unrecognised variant stays a legal
 * value that contributes no structure, leaving a consumer's CSS free to
 * define it. `intent` needs no equivalent: it was never anything but colour.
 */
const variantStructure: Record<string, string> = {
  solid: "shadow",
  soft: "",
  outline: "",
};

/**
 * Widened deliberately. Adding a variant or an intent is a CSS change in the
 * consuming app, not a release here — so the type has to admit values this
 * file has never heard of, while still autocompleting the ones it ships.
 */
type Loose<T extends string> = T | (string & {});

export type BadgeVariantName = "solid" | "soft" | "outline";
/** The system's intent set — the families src/theming/intents.css defines. */
export type BadgeIntentName = "neutral" | "brand" | "danger" | "success" | "warning";
export type BadgeVariant = Loose<BadgeVariantName>;
export type BadgeIntent = Loose<BadgeIntentName>;

export type BadgeRecipeProps = VariantProps<typeof badgeVariants> & {
  variant?: BadgeVariant | undefined;
  intent?: BadgeIntent | undefined;
  /** Re-points this element's brand tokens to a brand the theme defines. See the Scoped brands docs. */
  brand?: string | undefined;
  className?: string | undefined;
};

/**
 * The class string plus the attributes the recipe selects on. `data-brand` is
 * omitted unless `brand` is set, same as `buttonRecipe`.
 */
export function badgeRecipe({ variant = "solid", intent = "neutral", brand, size, className }: BadgeRecipeProps) {
  return {
    className: cn(variantStructure[variant], badgeVariants({ size, className })),
    "data-variant": variant,
    "data-intent": intent,
    "data-brand": brand,
  };
}

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants> & {
    variant?: BadgeVariant | undefined;
    intent?: BadgeIntent | undefined;
    /** Name of a brand the theme defines, rendered as `data-brand`. Omitted, the badge follows the nearest `data-brand` ancestor. */
    brand?: string | undefined;
  };

/**
 * Small label for status, category, or count.
 *
 * Two independent axes, same split as Button: `variant` is the fill
 * (`solid`, `soft`, `outline`), `intent` is what it signals (`neutral`,
 * `brand`, `danger`, `success`, `warning`). `neutral`, the default, is the
 * grey family; a brand-coloured badge says `intent="brand"`. `size` is `sm`
 * or `md` (the default).
 * Renders a `<span>`; purely presentational, so give it visible text — it
 * does not manage an accessible name of its own.
 *
 * Colour is not decided here: each variant resolves through a `--badge-*`
 * component token (src/components/Badge/badge.recipe.css) that paints with the
 * intent slots, the same seam Button uses, so a consumer can re-point a cell
 * or add an intent without a release.
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant = "solid", intent = "neutral", brand, size, ...props }, ref) => {
  return <span ref={ref} {...badgeRecipe({ variant, intent, brand, size, className })} {...props} />;
});
Badge.displayName = "Badge";

export { badgeVariants };
