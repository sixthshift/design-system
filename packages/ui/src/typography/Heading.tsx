import { Text, type TextProps } from "@sixthshift/ui/text";
import { cn } from "@sixthshift/ui/utils";
import * as React from "react";

const headingSizes = {
  h1: "text-4xl",
  h2: "text-3xl",
  h3: "text-2xl",
  h4: "text-xl",
  h5: "text-lg",
  h6: "text-base",
} as const;

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export type HeadingProps = Omit<TextProps, "as"> & {
  as?: HeadingLevel;
};

export const Heading = React.forwardRef<HTMLElement, HeadingProps>(({ as = "h2", className, ...props }, ref) => (
  <Text ref={ref} as={as} className={cn("font-semibold tracking-tight", headingSizes[as], className)} {...props} />
));
Heading.displayName = "Heading";
