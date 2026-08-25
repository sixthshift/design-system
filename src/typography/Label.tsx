import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(({ className, ...props }, ref) => (
  // biome-ignore lint/a11y/noLabelWithoutControl: Generic label component can be used with or without controls via htmlFor prop
  <label ref={ref} className={cn("font-medium text-sm", className)} {...props} />
));
Label.displayName = "Label";
