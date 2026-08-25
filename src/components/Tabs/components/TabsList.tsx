import { cn } from "@sixthshift/design-system/utils";
import type * as React from "react";
import { useCallback, useRef } from "react";
import { useTabsContext } from "./TabsContext";
import { TabsTrigger } from "./TabsTrigger";

export type TabsListProps = {
  /** Layout direction */
  orientation?: "horizontal" | "vertical";
  /** Additional CSS classes */
  className?: string;
};

export const TabsList = ({ orientation = "horizontal", className }: TabsListProps) => {
  const { items, value, onValueChange } = useTabsContext();
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Get enabled items and their indices
  const enabledItems = items.map((item, index) => ({ item, index })).filter(({ item }) => !item.disabled);

  const getCurrentEnabledIndex = useCallback(() => {
    return enabledItems.findIndex(({ item }) => item.value === value);
  }, [enabledItems, value]);

  const focusAndSelect = useCallback(
    (index: number) => {
      const targetRef = triggerRefs.current[index];
      if (targetRef) {
        targetRef.focus();
        const item = items[index];
        if (item && !item.disabled) {
          onValueChange(item.value);
        }
      }
    },
    [items, onValueChange]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const currentEnabledIdx = getCurrentEnabledIndex();
      if (currentEnabledIdx === -1 || enabledItems.length === 0) return;

      const isHorizontal = orientation === "horizontal";
      const prevKey = isHorizontal ? "ArrowLeft" : "ArrowUp";
      const nextKey = isHorizontal ? "ArrowRight" : "ArrowDown";

      let newEnabledIdx = currentEnabledIdx;

      switch (event.key) {
        case prevKey:
          event.preventDefault();
          newEnabledIdx = currentEnabledIdx > 0 ? currentEnabledIdx - 1 : enabledItems.length - 1;
          break;
        case nextKey:
          event.preventDefault();
          newEnabledIdx = currentEnabledIdx < enabledItems.length - 1 ? currentEnabledIdx + 1 : 0;
          break;
        case "Home":
          event.preventDefault();
          newEnabledIdx = 0;
          break;
        case "End":
          event.preventDefault();
          newEnabledIdx = enabledItems.length - 1;
          break;
        default:
          return;
      }

      const targetItem = enabledItems[newEnabledIdx];
      if (targetItem) {
        focusAndSelect(targetItem.index);
      }
    },
    [orientation, getCurrentEnabledIndex, enabledItems, focusAndSelect]
  );

  return (
    <div
      role="tablist"
      aria-orientation={orientation}
      className={cn("inline-flex gap-1", orientation === "vertical" ? "flex-col" : "flex-row items-center", className)}
      onKeyDown={handleKeyDown}
    >
      {items.map((item, index) => (
        <TabsTrigger
          key={item.value}
          item={item}
          index={index}
          ref={(el) => {
            triggerRefs.current[index] = el;
          }}
        />
      ))}
    </div>
  );
};
