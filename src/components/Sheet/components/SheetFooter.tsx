import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";

export type SheetFooterProps = React.HTMLAttributes<HTMLDivElement>;

export const SheetFooter = React.forwardRef<HTMLDivElement, SheetFooterProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("sheet-footer border-(color:--sheet-footer-border) flex items-center border-t p-4", className)} {...props} />
));
SheetFooter.displayName = "SheetFooter";
