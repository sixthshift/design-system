import { cn } from "@sixthshift/ui/utils";
import type { ReactNode } from "react";

export type MetricListProps = {
  /** Metric rows */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
};

export const MetricList = ({ children, className }: MetricListProps) => {
  return <div className={cn("flex flex-col gap-2 text-fg-subtle", className)}>{children}</div>;
};
