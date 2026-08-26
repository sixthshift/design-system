import { createContext, type PropsWithChildren, useContext, useMemo } from "react";

/**
 * Internal close signal for a mounted modal. App-level callback — no event arg.
 * Used by ModalHeader's X button and by `useModal`'s programmatic overlay system.
 */
export type OnClose = () => void;

interface ModalContextValue {
  onClose: OnClose;
  closable?: boolean | undefined;
  /**
   * The id `Modal.Header` stamps on itself so the dialog can name itself from
   * its own title. A dialog with no accessible name is announced as just
   * "dialog", which tells a screen-reader user nothing about what interrupted
   * them.
   */
  titleId?: string;
  /**
   * The header reports its presence, because a headerless modal must not point
   * `aria-labelledby` at an element that never rendered — a dangling reference
   * is worse than no reference at all (it resolves to an empty name and axe
   * flags it as an invalid attribute value).
   */
  registerTitle?: (present: boolean) => void;
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
