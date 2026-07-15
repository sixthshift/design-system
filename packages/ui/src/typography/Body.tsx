import { Text, type TextProps } from "@sixthshift/ui/text";
import { cn } from "@sixthshift/ui/utils";
import * as React from "react";

export const Body = React.forwardRef<HTMLElement, TextProps>(({ as = "p", className, ...props }, ref) => (
  <Text ref={ref} as={as} className={cn("text-fg-normal text-sm", className)} {...props} />
));
Body.displayName = "Body";
