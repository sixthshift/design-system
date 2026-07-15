import { createContext, type PropsWithChildren, useContext, useMemo } from "react";

/**
 * Internal close signal for a mounted modal. App-level callback — no event arg.
 * Used by ModalHeader's X button and by `useModal`'s programmatic overlay system.
 */
export type OnClose = () => void;

interface ModalContextValue {
  onClose: OnClose;
  closable?: boolean | undefined;
}

export const ModalContext = createContext<ModalContextValue | null>(null);

export function useModalContext() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModalContext must be used within a Modal");
  }
  return context;
}

export const ModalContextProvider = ({ onClose, closable, children }: PropsWithChildren<{ onClose: OnClose; closable?: boolean }>) => {
  const value = useMemo(() => ({ onClose, closable }), [onClose, closable]);
  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
};
