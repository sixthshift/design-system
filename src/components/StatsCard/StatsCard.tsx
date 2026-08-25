import { Caption } from "@sixthshift/design-system/caption";
import { cn } from "@sixthshift/design-system/utils";
import type { ReactNode } from "react";

export type StatsCardProps = {
  /** Title of the stats card */
  title: string;
  /** Description text shown below the title */
  description: string;
  /** Optional icon displayed in the header */
  icon?: ReactNode;
  /** Visual status indicator via left border color */
  status?: "healthy" | "warning" | "error" | "neutral";
  /** Card content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
};

const statusColors = {
  healthy: "border-l-green-500",
  warning: "border-l-amber-500",
  error: "border-l-red-500",
  neutral: "border-l-border-subtle",
};

export const StatsCard = ({ title, description, icon, status = "neutral", children, className }: StatsCardProps) => {
  return (
    <div className={cn("flex flex-col gap-3 rounded border border-border-subtle border-l-2 bg-bg-subtle p-4", statusColors[status], className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-fg-normal">{title}</span>
          <Caption>{description}</Caption>
        </div>
        {icon && <div className="text-fg-subtle">{icon}</div>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
};
