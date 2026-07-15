import { Text, type TextProps } from "@sixthshift/ui/text";
import { cn } from "@sixthshift/ui/utils";
import * as React from "react";

export const Emphasis = React.forwardRef<HTMLElement, TextProps>(({ className, ...props }, ref) => (
  <Text ref={ref} className={cn("font-medium text-sm", className)} {...props} />
));
Emphasis.displayName = "Emphasis";
