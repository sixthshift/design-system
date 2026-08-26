import { Muted } from "@sixthshift/design-system/muted";
import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";

export type EmptyStateProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Optional icon to display */
  icon?: React.ReactNode;
  /** Message to display */
  message: string;
  /** Optional description for more context */
  description?: string;
  /** Optional action button or element */
  action?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
};

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(({ icon, message, description, action, className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("flex flex-col items-center justify-center gap-3 p-8 text-center", className)} {...props}>
      {icon && <div className="text-fg-subtle">{icon}</div>}
      <div className="flex flex-col gap-1">
        <Muted>{message}</Muted>
        {description && <span className="text-fg-subtle text-xs">{description}</span>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
});
EmptyState.displayName = "EmptyState";
