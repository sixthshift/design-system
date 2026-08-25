import { Text, type TextProps } from "@sixthshift/design-system/text";
import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";

export const Lead = React.forwardRef<HTMLElement, TextProps>(({ as = "p", className, ...props }, ref) => (
  <Text ref={ref} as={as} className={cn("text-fg-subtle text-lg leading-relaxed", className)} {...props} />
));
Lead.displayName = "Lead";
