import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";

export type MessageTitleProps = React.HTMLAttributes<HTMLDivElement>;

export const MessageTitle = React.forwardRef<HTMLDivElement, MessageTitleProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("font-medium leading-none", className)} {...props} />;
});
MessageTitle.displayName = "MessageTitle";
