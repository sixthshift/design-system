import { cn } from "@sixthshift/design-system/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

/**
 * Geometry only.
 *
 * Colour reads a single `--color-dot-bg` component token whose value is
 * decided by src/theme/recipes/color-dot.css. That file is the mapping from
 * `intent` to a semantic token — the layer that used to be the hand-rolled
 * `INTENT_CLASSES` lookup here, where it was compiled into class-name
 * literals and unreachable from outside. Nothing in this file names a
 * colour, which is the point: the semantics are now configurable without a
 * release.
 */
const colorDotVariants = cva("color-dot inline-block shrink-0 rounded-full bg-(--color-dot-bg)", {
  variants: {
    size: {
      sm: "h-1.5 w-1.5",
      md: "h-2 w-2",
      lg: "h-2.5 w-2.5",
    },
    pulse: {
      true: "animate-pulse",
      false: "",
    },
  },
  defaultVariants: {
    size: "md",
    pulse: false,
  },
});

/**
 * Widened deliberately. Adding an intent is a CSS change in the consuming
 * app, not a release here — so the type has to admit values this file has
 * never heard of, while still autocompleting the ones it ships.
 *
 * The `color` prop itself stays plain `string` (see `ColorDotProps` below):
 * it doubles as the escape hatch for an arbitrary CSS colour, so it was
 * never narrowable to begin with. `ColorDotIntent` exists purely to
 * document, and let consumers reference, the names this recipe currently
 * ships a cell for.
 */
type Loose<T extends string> = T | (string & {});

export type ColorDotIntentName = "neutral" | "brand" | "primary" | "success" | "warning" | "danger";
export type ColorDotIntent = Loose<ColorDotIntentName>;

/** The names `color` resolves through the recipe rather than as a literal CSS colour. */
const KNOWN_INTENTS = new Set<string>(["neutral", "brand", "primary", "success", "warning", "danger"] satisfies ColorDotIntentName[]);

export type ColorDotProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof colorDotVariants> & {
    /** Intent name (neutral, brand, primary, success, warning, danger) or arbitrary CSS color */
    color: string;
  };

/**
 * Small filled circle for a status or category indicator — placed beside a
 * label rather than standing alone, since it carries no accessible name.
 *
 * `color` accepts either a known intent name (`neutral`, `brand`, `primary`,
 * `success`, `warning`, `danger`) — resolved through the `--color-dot-bg`
 * component token (src/theme/recipes/color-dot.css) and recorded via
 * `data-intent` — or an arbitrary CSS colour string, which instead falls
 * back to an inline `background-color` and skips `data-intent` entirely.
 * `neutral` deliberately reads a `fg-` token (`--fg-subtle`) as its
 * background rather than a `bg-` token — a muted dot reads better as the
 * subtle foreground grey. `size` scales the diameter (`sm` | `md` | `lg`,
 * default `md`); `pulse` adds an `animate-pulse` for an actively-changing
 * status.
 */
export const ColorDot = React.forwardRef<HTMLSpanElement, ColorDotProps>(({ color, size, pulse, className, style, ...props }, ref) => {
  const isIntent = KNOWN_INTENTS.has(color);

  return (
    <span
      ref={ref}
      className={cn(colorDotVariants({ size, pulse }), className)}
      data-intent={isIntent ? color : undefined}
      style={isIntent ? style : { ...style, backgroundColor: color }}
      {...props}
    />
  );
});
ColorDot.displayName = "ColorDot";

export { colorDotVariants };
