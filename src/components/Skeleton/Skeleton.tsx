import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";

/**
 * Pulsing placeholder block for the initial-load state of a data view — size
 * it to match the eventual layout via `className` (e.g. `className="h-4
 * w-32"`) so the page doesn't jump when real content arrives.
 *
 * Renders a plain `<div>` with no props of its own beyond `className`, and
 * no ARIA baked in — it does not mark itself `aria-hidden`, nor does it
 * announce loading to assistive tech. Wrap a group of skeletons in your own
 * `aria-busy`/live region if that announcement matters for the surface.
 */
const Skeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("animate-pulse rounded-md bg-bg-strong/10", className)} {...props} />;
});
Skeleton.displayName = "Skeleton";

export { Skeleton };
