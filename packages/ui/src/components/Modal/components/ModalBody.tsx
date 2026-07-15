import { cn } from "@sixthshift/ui/utils";
import * as React from "react";

export type ModalBodyProps = React.HTMLAttributes<HTMLDivElement>;

export const ModalBody = React.forwardRef<HTMLDivElement, ModalBodyProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex-1 overflow-y-auto p-6 pt-0", className)} {...props} />
));
ModalBody.displayName = "ModalBody";
