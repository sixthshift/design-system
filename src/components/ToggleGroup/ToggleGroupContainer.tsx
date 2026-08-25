import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";
import type { ToggleGroupBaseProps } from "./toggleGroup.types";

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & Required<Pick<ToggleGroupBaseProps, "appearance" | "orientation">>;

const ToggleGroupContainer = React.forwardRef<HTMLDivElement, ContainerProps>(({ appearance, orientation, className, children, ...props }, ref) => {
  const isVertical = orientation === "vertical";
  const isSegmented = appearance === "segmented";

  return (
    <div ref={ref} className={cn("inline-flex", isVertical ? "flex-col" : "flex-row", !isSegmented && "gap-2", className)} {...props}>
      {children}
    </div>
  );
});
ToggleGroupContainer.displayName = "ToggleGroupContainer";

export { ToggleGroupContainer };
