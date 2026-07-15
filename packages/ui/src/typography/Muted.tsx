import { Text, type TextProps } from "@sixthshift/ui/text";
import { cn } from "@sixthshift/ui/utils";
import * as React from "react";

export const Muted = React.forwardRef<HTMLElement, TextProps>(({ className, ...props }, ref) => (
  <Text ref={ref} className={cn("text-fg-subtle text-sm", className)} {...props} />
));
Muted.displayName = "Muted";
