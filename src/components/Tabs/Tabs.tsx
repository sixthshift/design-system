"use client";

import { useControllableState } from "@sixthshift/design-system/hooks";
import type * as React from "react";
import { useId } from "react";
import { type TabItem, TabsContext } from "./components/TabsContext";
import { TabsList } from "./components/TabsList";
import { TabsPanels } from "./components/TabsPanels";

export type TabsProps = {
  /** Tab definitions */
  items: TabItem[];
  /** Controlled selected value */
  value?: string;
  /** Default value for uncontrolled mode */
  defaultValue?: string;
  /** Callback when selection changes */
  onValueChange?: (value: string) => void;
  /** Children - compound components (Tabs.List, Tabs.Panels) */
  children: React.ReactNode;
};

const TabsRoot = ({ items, value: controlledValue, defaultValue, onValueChange, children }: TabsProps) => {
  // Default to first non-disabled item if no defaultValue provided
  const firstEnabledValue = items.find((item) => !item.disabled)?.value ?? items[0]?.value ?? "";

  const [value, setValue] = useControllableState({
    value: controlledValue,
    defaultValue: defaultValue ?? firstEnabledValue,
    onChange: onValueChange,
  });

  const id = useId();
  const baseId = `tabs-${id}`;

  const contextValue: React.ContextType<typeof TabsContext> = {
    items,
    value,
    onValueChange: setValue,
    baseId,
  };

  return <TabsContext.Provider value={contextValue}>{children}</TabsContext.Provider>;
};

/**
 * NOTE: Storybook shows the copy in Tabs.stories.tsx
 * (`parameters.docs.description.component`), not this comment. react-docgen
 * cannot extract a description from an `Object.assign` / cast export, so a
 * second copy here would only drift. Edit the stories file.
 */
export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Panels: TabsPanels,
});

export type { TabItem };
