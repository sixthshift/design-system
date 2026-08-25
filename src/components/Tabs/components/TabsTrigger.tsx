import { Badge } from "@sixthshift/design-system/badge";
import { cn } from "@sixthshift/design-system/utils";
import { cva } from "class-variance-authority";
import { forwardRef } from "react";
import { type TabItem, useTabsContext } from "./TabsContext";

const tabsTriggerVariants = cva(
  `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md
  px-3 py-1.5 text-sm font-medium cursor-pointer transition-colors focus-visible:outline-hidden
  focus-visible:ring-2 focus-visible:ring-focus-ring
  focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50`,
  {
    variants: {
      selected: {
        true: "bg-bg-brand-pressed text-fg-on-brand-pressed",
        false: "text-fg-subtle hover:bg-bg-subtle-hovered hover:text-fg-normal",
      },
    },
    defaultVariants: {
      selected: false,
    },
  }
);

export type TabsTriggerProps = {
  item: TabItem;
  index: number;
};

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(({ item, index }, ref) => {
  const { value, onValueChange, baseId } = useTabsContext();
  const isSelected = value === item.value;
  const triggerId = `${baseId}-trigger-${item.value}`;
  const panelId = `${baseId}-panel-${item.value}`;

  const handleClick = () => {
    if (!item.disabled) {
      onValueChange(item.value);
    }
  };

  return (
    <button
      ref={ref}
      id={triggerId}
      role="tab"
      type="button"
      aria-selected={isSelected}
      // Only the selected panel is mounted (content is lazy), so pointing an
      // unselected tab at a panel id absent from the DOM would be a dangling
      // reference. Omit it instead.
      aria-controls={isSelected ? panelId : undefined}
      tabIndex={isSelected ? 0 : -1}
      disabled={item.disabled}
      data-index={index}
      className={cn(tabsTriggerVariants({ selected: isSelected }))}
      onClick={handleClick}
    >
      {item.label}
      {item.badge !== undefined && (
        <Badge variant="soft" intent="neutral" className="ml-1 min-w-[1.25rem] px-1.5 py-0">
          {item.badge}
        </Badge>
      )}
    </button>
  );
});

TabsTrigger.displayName = "TabsTrigger";
