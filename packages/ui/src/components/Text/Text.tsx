import { cn } from "@sixthshift/ui/utils";
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
