import { cn } from "@sixthshift/design-system/utils";
import { forwardRef } from "react";
import { useTabsContext } from "./TabsContext";

export type TabsPanelsProps = {
  /** Additional CSS classes */
  className?: string;
};

export const TabsPanels = forwardRef<HTMLDivElement, TabsPanelsProps>(({ className }, ref) => {
  const { items, value, baseId } = useTabsContext();

  const activeItem = items.find((item) => item.value === value);
  if (!activeItem) return null;

  const panelId = `${baseId}-panel-${value}`;
  const triggerId = `${baseId}-trigger-${value}`;

  // Support lazy content
  const content = typeof activeItem.content === "function" ? activeItem.content() : activeItem.content;

  return (
    <div ref={ref} id={panelId} role="tabpanel" aria-labelledby={triggerId} className={cn("focus-visible:outline-hidden", className)}>
      {content}
    </div>
  );
});
TabsPanels.displayName = "TabsPanels";
