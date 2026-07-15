import { Text, type TextProps } from "@sixthshift/ui/text";
import { cn } from "@sixthshift/ui/utils";
import * as React from "react";

export const Code = React.forwardRef<HTMLElement, TextProps>(({ className, ...props }, ref) => (
  <Text ref={ref} as="code" className={cn("rounded bg-bg-subtle px-1.5 py-0.5 font-mono text-sm", className)} {...props} />
));
Code.displayName = "Code";
