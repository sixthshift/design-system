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

/**
 * A centered placeholder for a list or page that has no data to show: an
 * optional icon, a `message` naming the fact, an optional `description` with
 * more detail, and an optional `action` (typically a button) offering the
 * next step. Purely presentational — a plain stack with no ARIA role or live
 * region of its own, so a caller replacing dynamic content with it (e.g. via
 * an `withEmpty` boundary) is responsible for any surrounding semantics.
 *
 * `message` is required and is the one thing every empty state needs to say;
 * `icon`, `description`, and `action` are all optional layering on top of it.
 */
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
