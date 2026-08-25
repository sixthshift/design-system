import { Text, type TextProps } from "@sixthshift/design-system/text";
import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";

export const Timestamp = React.forwardRef<HTMLElement, TextProps>(({ className, ...props }, ref) => (
  <Text ref={ref} className={cn("font-mono text-fg-subtle text-xs", className)} {...props} />
));
Timestamp.displayName = "Timestamp";
