import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";

export type MessageBodyProps = React.HTMLAttributes<HTMLDivElement>;

export const MessageBody = React.forwardRef<HTMLDivElement, MessageBodyProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("flex min-w-0 flex-1 flex-col gap-1", className)} {...props} />;
});
MessageBody.displayName = "MessageBody";
