import { Badge } from "@sixthshift/design-system/badge";
import { cn } from "@sixthshift/design-system/utils";
import { cva } from "class-variance-authority";
import { forwardRef } from "react";
import { type TabItem, useTabsContext } from "./TabsContext";

/**
 * Geometry and behaviour only.
 *
 * Colour reads `--tabs-trigger-bg` / `--tabs-trigger-fg` component tokens
 * (each with a `-hovered` state) whose values are decided by
 * src/theme/recipes/tabs.css. That file is the mapping from `selected` to a
 * semantic token — the layer that used to be the two branches of a `cva`
 * `selected` variant here, compiled into class-name literals and unreachable
 * from outside. Nothing in this file names a colour, which is the point: the
 * semantics are now configurable without a release.
 */
const tabsTriggerVariants = cva(
  `tabs-trigger inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md
  px-3 py-1.5 text-sm font-medium cursor-pointer transition-colors bg-(--tabs-trigger-bg)
  text-(--tabs-trigger-fg) hover:bg-(--tabs-trigger-bg-hovered) hover:text-(--tabs-trigger-fg-hovered)
  focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-(color:--tabs-trigger-ring)
  focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50`,
  {
    variants: {
      // No longer carries colour — see the recipe file. Kept as a variant
      // (rather than dropped) purely so `data-selected` and the exported
      // `tabsTriggerVariants` shape stay symmetric with the `isSelected` prop
      // callers already pass.
      selected: {
        true: "",
        false: "",
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
      data-selected={isSelected}
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
