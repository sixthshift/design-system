import { createContext, type KeyboardEvent, type MouseEvent, type PropsWithChildren, useContext, useMemo } from "react";

export type OnClose = (event?: MouseEvent<Element> | KeyboardEvent<Element>) => void;

interface SheetContextValue {
  onClose: OnClose;
  closable?: boolean | undefined;
}

export const SheetContext = createContext<SheetContextValue | null>(null);

export function useSheetContext() {
  const context = useContext(SheetContext);
  if (!context) {
    throw new Error("useSheetContext must be used within a Sheet");
  }
  return context;
}

export const SheetContextProvider = ({ onClose, closable, children }: PropsWithChildren<{ onClose: OnClose; closable?: boolean }>) => {
  const value = useMemo(() => ({ onClose, closable }), [onClose, closable]);
  return <SheetContext.Provider value={value}>{children}</SheetContext.Provider>;
};
