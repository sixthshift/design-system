import { cn } from "@sixthshift/design-system/utils";
import type { ReactNode } from "react";

export type MetricRowProps = {
  /** Label displayed on the left */
  label: string;
  /** Value displayed on the right, can be string or ReactNode for complex content */
  value: ReactNode;
  /** Optional variant for styling the value */
  valueVariant?: "normal" | "success" | "warning" | "danger" | "info";
  /** Additional CSS classes */
  className?: string;
};

const valueVariants = {
  normal: "text-fg-normal",
  success: "text-fg-success",
  warning: "text-fg-warning",
  danger: "text-fg-danger",
  info: "text-fg-brand",
};

export const MetricRow = ({ label, value, valueVariant = "normal", className }: MetricRowProps) => {
  return (
    <div className={cn("flex justify-between", className)}>
      <span>{label}</span>
      <span className={valueVariants[valueVariant]}>{value}</span>
    </div>
  );
};
