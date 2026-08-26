import { createContext, useContext } from "react";

export type PopoverContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refs: {
    setReference: (node: HTMLElement | null) => void;
    setFloating: (node: HTMLElement | null) => void;
  };
  floatingStyles: React.CSSProperties;
  getReferenceProps: (props?: React.HTMLProps<HTMLElement>) => Record<string, unknown>;
  getFloatingProps: (props?: React.HTMLProps<HTMLElement>) => Record<string, unknown>;
  contentId: string;
  triggerId: string;
};

export const PopoverContext = createContext<PopoverContextValue | null>(null);

export function usePopoverContext() {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error("Popover compound components must be used within <Popover>");
  }
  return context;
}
