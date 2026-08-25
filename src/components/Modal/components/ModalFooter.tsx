import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";

export type ModalFooterProps = React.HTMLAttributes<HTMLDivElement>;

export const ModalFooter = React.forwardRef<HTMLDivElement, ModalFooterProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
));
ModalFooter.displayName = "ModalFooter";
