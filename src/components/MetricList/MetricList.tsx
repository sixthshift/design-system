import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";

export type MetricListProps = {
  /** Metric rows */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
};

export const MetricList = React.forwardRef<HTMLDivElement, MetricListProps>(({ children, className }, ref) => {
  return (
    <div ref={ref} className={cn("flex flex-col gap-2 text-fg-subtle", className)}>
      {children}
    </div>
  );
});
MetricList.displayName = "MetricList";
