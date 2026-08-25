import { Text, type TextProps } from "@sixthshift/design-system/text";
import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";

export const Subtitle = React.forwardRef<HTMLElement, TextProps>(({ className, ...props }, ref) => (
  <Text ref={ref} className={cn("text-fg-subtle", className)} {...props} />
));
Subtitle.displayName = "Subtitle";
