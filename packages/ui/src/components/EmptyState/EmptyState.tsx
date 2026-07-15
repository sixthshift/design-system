import { Muted } from "@sixthshift/ui/muted";
import { cn } from "@sixthshift/ui/utils";
import type { ReactNode } from "react";

export type EmptyStateProps = {
  /** Optional icon to display */
  icon?: ReactNode;
  /** Message to display */
  message: string;
  /** Optional description for more context */
  description?: string;
  /** Optional action button or element */
  action?: ReactNode;
  /** Additional CSS classes */
  className?: string;
};

export const EmptyState = ({ icon, message, description, action, className }: EmptyStateProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 p-8 text-center", className)}>
      {icon && <div className="text-fg-subtle">{icon}</div>}
      <div className="flex flex-col gap-1">
        <Muted>{message}</Muted>
        {description && <span className="text-fg-subtle text-xs">{description}</span>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};
