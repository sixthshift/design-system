import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";

export type SeparatorProps = React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
};

/**
 * Thin dividing line, horizontal or vertical (`orientation`, default
 * `"horizontal"`). Renders a `<div>`, not `<hr>`.
 *
 * `decorative` (default `true`) controls whether it is exposed to assistive
 * tech: decorative renders `role="none"` and no `aria-orientation`, so it is
 * invisible to a screen reader; set `decorative={false}` for a divider that
 * is actually part of the content's structure (e.g. between menu sections),
 * which renders `role="separator"` and `aria-orientation` instead.
 */
const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
  <div
    ref={ref}
    role={decorative ? "none" : "separator"}
    {...(!decorative && { "aria-orientation": orientation })}
    className={cn("shrink-0 bg-border-normal", orientation === "horizontal" ? "h-px w-full" : "h-full w-px", className)}
    {...props}
  />
));
Separator.displayName = "Separator";

export { Separator };
