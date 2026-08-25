import { Text, type TextProps } from "@sixthshift/design-system/text";
import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";

export const SectionTitle = React.forwardRef<HTMLElement, TextProps>(({ className, ...props }, ref) => (
  <Text ref={ref} className={cn("font-medium text-fg-subtle text-sm uppercase tracking-wide", className)} {...props} />
));
SectionTitle.displayName = "SectionTitle";
