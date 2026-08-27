import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";

/*
 * Text Preset Reference
 * ---------------------
 * When creating semantic text presets, consider these Tailwind classes:
 *
 * Size:      text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl, text-4xl
 * Weight:    font-normal, font-medium, font-semibold, font-bold
 * Color:     text-fg-normal, text-fg-subtle, text-fg-strong, text-fg-brand, text-fg-danger, text-fg-success, text-fg-warning
 * Leading:   leading-none, leading-tight, leading-snug, leading-normal, leading-relaxed, leading-loose
 * Tracking:  tracking-tighter, tracking-tight, tracking-normal, tracking-wide, tracking-wider, tracking-widest
 * Align:     text-left, text-center, text-right
 * Transform: uppercase, lowercase, capitalize, normal-case
 * Truncate:  truncate
 */

export type TextElement = "span" | "p" | "div" | "label" | "code" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export type TextProps = React.HTMLAttributes<HTMLElement> & {
  as?: TextElement;
};

/**
 * The polymorphic base every typography preset (`Heading`, `Body`,
 * `Emphasis`, ...) is built on: renders as `as` (default `span`) and applies
 * no styling of its own beyond `className`.
 *
 * Reach for a preset first — the typographic ramp (docs/visual-hierarchy.md)
 * is what keeps text sizing and color consistent across the app. Use `Text`
 * directly only for one-off text that doesn't fit an existing preset.
 */
const Text = React.forwardRef<HTMLElement, TextProps>(({ as: Comp = "span", className, ...props }, ref) => (
  <Comp
    // biome-ignore lint/suspicious/noExplicitAny: polymorphic ref requires any
    ref={ref as any}
    className={cn(className)}
    {...props}
  />
));
Text.displayName = "Text";

export { Text };
