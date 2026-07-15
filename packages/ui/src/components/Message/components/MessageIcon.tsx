import { cn } from "@sixthshift/ui/utils";
import * as React from "react";

export type MessageIconProps = React.HTMLAttributes<HTMLDivElement>;

export const MessageIcon = React.forwardRef<HTMLDivElement, MessageIconProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("flex h-4 w-4 shrink-0", className)} {...props}>
      {children}
    </div>
  );
});
MessageIcon.displayName = "MessageIcon";
