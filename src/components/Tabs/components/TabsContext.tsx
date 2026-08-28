"use client";

import { createContext, type ReactNode, useContext } from "react";

export type TabItem = {
  /** Unique identifier for this tab */
  value: string;
  /** Tab trigger content (displayed in the tab list) */
  label: ReactNode;
  /** Optional badge to display on the tab */
  badge?: number | string;
  /** Whether this tab is disabled */
  disabled?: boolean;
  /** Panel content - can be a ReactNode or lazy function */
  content: ReactNode | (() => ReactNode);
};

export type TabsContextValue = {
  /** All tab items */
  items: TabItem[];
  /** Currently selected tab value */
  value: string;
  /** Callback when selection changes */
  onValueChange: (value: string) => void;
  /** Base ID for generating ARIA IDs */
  baseId: string;
};

export const TabsContext = createContext<TabsContextValue | null>(null);

export function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs compound components must be used within <Tabs>");
  }
  return context;
}
