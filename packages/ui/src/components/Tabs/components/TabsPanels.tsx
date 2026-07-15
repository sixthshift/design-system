import { cn } from "@sixthshift/ui/utils";
import { useTabsContext } from "./TabsContext";

export type TabsPanelsProps = {
  /** Additional CSS classes */
  className?: string;
};

export const TabsPanels = ({ className }: TabsPanelsProps) => {
  const { items, value, baseId } = useTabsContext();

  const activeItem = items.find((item) => item.value === value);
  if (!activeItem) return null;

  const panelId = `${baseId}-panel-${value}`;
  const triggerId = `${baseId}-trigger-${value}`;

  // Support lazy content
  const content = typeof activeItem.content === "function" ? activeItem.content() : activeItem.content;

  return (
    <div id={panelId} role="tabpanel" aria-labelledby={triggerId} className={cn("focus-visible:outline-hidden", className)}>
      {content}
    </div>
  );
};
