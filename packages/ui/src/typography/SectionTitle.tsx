import { Text, type TextProps } from "@sixthshift/ui/text";
import { cn } from "@sixthshift/ui/utils";
import * as React from "react";

export const SectionTitle = React.forwardRef<HTMLElement, TextProps>(({ className, ...props }, ref) => (
  <Text ref={ref} className={cn("font-medium text-fg-subtle text-sm uppercase tracking-wide", className)} {...props} />
));
SectionTitle.displayName = "SectionTitle";
