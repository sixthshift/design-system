import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";

export type MessageIconProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Centred on the first line of text rather than pinned to the top: `1lh` is
 * the root's line height (`text-sm` or `text-xs`), so the offset holds at
 * both sizes and when the title wraps.
 */
export const MessageIcon = React.forwardRef<HTMLDivElement, MessageIconProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("mt-[calc((1lh-1rem)/2)] flex h-4 w-4 shrink-0", className)} {...props}>
      {children}
    </div>
  );
});
MessageIcon.displayName = "MessageIcon";
