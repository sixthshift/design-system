import { Text, type TextProps } from "@sixthshift/design-system/text";
import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";

export const Emphasis = React.forwardRef<HTMLElement, TextProps>(({ className, ...props }, ref) => (
  <Text ref={ref} className={cn("font-medium text-sm", className)} {...props} />
));
Emphasis.displayName = "Emphasis";
