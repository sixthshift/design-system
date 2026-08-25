import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";

export type SheetBodyProps = React.HTMLAttributes<HTMLDivElement>;

export const SheetBody = React.forwardRef<HTMLDivElement, SheetBodyProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex-1 overflow-y-auto p-6", className)} {...props} />
));
SheetBody.displayName = "SheetBody";
