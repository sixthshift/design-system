import { cn } from "@sixthshift/ui/utils";
import * as React from "react";

export type MessageDescriptionProps = React.HTMLAttributes<HTMLDivElement>;

export const MessageDescription = React.forwardRef<HTMLDivElement, MessageDescriptionProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("leading-relaxed opacity-90", className)} {...props} />;
});
MessageDescription.displayName = "MessageDescription";
