import { createContext, useContext } from "react";

export type TooltipContextValue = {
  open: boolean;
  refs: {
    setReference: (node: HTMLElement | null) => void;
    setFloating: (node: HTMLElement | null) => void;
  };
  floatingStyles: React.CSSProperties;
  getReferenceProps: (props?: React.HTMLProps<HTMLElement>) => Record<string, unknown>;
  getFloatingProps: (props?: React.HTMLProps<HTMLElement>) => Record<string, unknown>;
};

export const TooltipContext = createContext<TooltipContextValue | null>(null);

export function useTooltipContext() {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error("Tooltip compound components must be used within <Tooltip>");
  }
  return context;
}
