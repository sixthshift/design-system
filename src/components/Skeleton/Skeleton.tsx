import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";

const Skeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("animate-pulse rounded-md bg-bg-strong/10", className)} {...props} />;
});
Skeleton.displayName = "Skeleton";

export { Skeleton };
