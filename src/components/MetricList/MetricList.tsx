import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";

export type MetricListProps = {
  /** Metric rows */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
};

/**
 * Vertical stack for `MetricRow` children — a `<div>` with `flex flex-col
 * gap-2` and a subtle default text colour. Children-only API: it does not
 * validate or clone its children, so anything can go in the stack, not just
 * `MetricRow`. Not built on `Card`; nest it inside one (or another bordered
 * container) for the surface — see the stories for that pairing.
 */
export const MetricList = React.forwardRef<HTMLDivElement, MetricListProps>(({ children, className }, ref) => {
  return (
    <div ref={ref} className={cn("flex flex-col gap-2 text-fg-subtle", className)}>
      {children}
    </div>
  );
});
MetricList.displayName = "MetricList";
