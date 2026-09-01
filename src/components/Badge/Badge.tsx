import { cn } from "@sixthshift/design-system/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

/**
 * Geometry and behaviour only.
 *
 * Every colour reads a `--badge-*` component token whose value is decided by
 * src/components/Badge/badge.recipe.css. That file is the mapping from
 * `(variant, intent)` to a semantic token — the layer that used to be
 * `compoundVariants` here, where it was compiled into class-name literals and
 * unreachable from outside. Nothing in this file names a colour, which is the
 * point: the semantics are now configurable without a release.
 */
const badgeVariants = cva(
  // One literal, deliberately: `useSortedClasses --unsafe` strips the trailing
  // space before a `+`, silently welding the last class of one fragment to the
  // first of the next. The screenshots catch it, but a single string means the
  // sorter has nothing to break.
  "badge border-(color:--badge-border) focus:ring-(color:--badge-ring) inline-flex items-center rounded-md border bg-(--badge-bg) px-2.5 py-0.5 font-semibold text-(--badge-fg) text-xs transition-colors focus:outline-hidden focus:ring-2 focus:ring-offset-2",
  { variants: {} }
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
/**
 * `primary` was this component's name for the brand colour, and nothing else in
 * the system used it — the token is `--bg-brand`, and
 * docs/modals.md already told callers to write `intent="brand"`. It is off the
 * closed union as of this release but still resolves, via an aliased selector in
 * badge.css; `BadgeIntent` is widened, so it also still type-checks.
 */
export type BadgeIntentName = "neutral" | "brand" | "danger" | "success" | "warning" | "muted";
export type BadgeVariant = Loose<BadgeVariantName>;
export type BadgeIntent = Loose<BadgeIntentName>;

export type BadgeRecipeProps = VariantProps<typeof badgeVariants> & {
  variant?: BadgeVariant | undefined;
  intent?: BadgeIntent | undefined;
  className?: string | undefined;
};

/**
 * The class string plus the two attributes the recipe selects on.
 */
export function badgeRecipe({ variant = "solid", intent = "brand", className }: BadgeRecipeProps) {
  return {
    className: cn(variantStructure[variant], badgeVariants({ className })),
    "data-variant": variant,
    "data-intent": intent,
  };
}

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant | undefined;
  intent?: BadgeIntent | undefined;
};

/**
 * Small label for status, category, or count.
 *
 * Two independent axes, same split as Button: `variant` is the fill
 * (`solid`, `soft`, `outline`), `intent` is what it signals (`neutral`,
 * `brand`, `danger`, `success`, `warning`, `muted`) — `muted` has no
 * Button equivalent, for de-emphasized metadata rather than a status.
 * Renders a `<span>`; purely presentational, so give it visible text — it
 * does not manage an accessible name of its own.
 *
 * Colour is not decided here: each `(variant, intent)` pairing resolves
 * through a `--badge-*` component token (src/components/Badge/badge.recipe.css), the
 * same seam Button uses, so a consumer can re-point a cell without a
 * release.
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant = "solid", intent = "brand", ...props }, ref) => {
  return <span ref={ref} {...badgeRecipe({ variant, intent, className })} {...props} />;
});
Badge.displayName = "Badge";

export { badgeVariants };
