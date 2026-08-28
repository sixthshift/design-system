"use client";

import { createContext, useContext } from "react";

export type HoverCardContextValue = {
  open: boolean;
  refs: {
    setReference: (node: HTMLElement | null) => void;
    setFloating: (node: HTMLElement | null) => void;
  };
  floatingStyles: React.CSSProperties;
  getReferenceProps: (props?: React.HTMLProps<HTMLElement>) => Record<string, unknown>;
  getFloatingProps: (props?: React.HTMLProps<HTMLElement>) => Record<string, unknown>;
};

export const HoverCardContext = createContext<HoverCardContextValue | null>(null);

export function useHoverCardContext() {
  const context = useContext(HoverCardContext);
  if (!context) {
    throw new Error("HoverCard compound components must be used within <HoverCard>");
  }
  return context;
}
