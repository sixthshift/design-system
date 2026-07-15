import { FloatingPortal, type FloatingPortalProps } from "@floating-ui/react";
import { type StackItem, useStack } from "@sixthshift/ui/hooks";
import { createContext, type FunctionComponent, type PropsWithChildren, useContext, useEffect, useMemo } from "react";

type OverlayContextProps = {
  modal?: FloatingPortalProps["root"];
  toast?: FloatingPortalProps["root"];
};

/** Stack item for overlays - component is a self-contained wrapper */
type OverlayStackItem = StackItem & {
  // biome-ignore lint/suspicious/noExplicitAny: Component type needs to be flexible for different overlay types (Toast, Modal, etc.)
  component: FunctionComponent<any>;
  /** Live data passed to the component via update() */
  data?: unknown;
  /** Close handler for escape key handling */
  onClose?: (() => void) | undefined;
};

type OverlayContextType = {
  modalRoot: FloatingPortalProps["root"];
  modalStack: ReturnType<typeof useStack<OverlayStackItem>>;
  toastRoot: FloatingPortalProps["root"];
  toastStack: ReturnType<typeof useStack<OverlayStackItem>>;
};

const OverlayContext = createContext<OverlayContextType>(undefined as unknown as OverlayContextType);
export const useOverlayContext = () => useContext(OverlayContext);

export const OverlayProvider = ({ modal: modalRoot, toast: toastRoot, children }: PropsWithChildren<OverlayContextProps>) => {
  const resolvedModalRoot = modalRoot ?? document.body;
  const resolvedToastRoot = toastRoot ?? document.body;

  const modalStack = useStack<OverlayStackItem>([]);
  const toastStack = useStack<OverlayStackItem>([]);

  const [modals] = modalStack;
  const [toasts] = toastStack;

  // Global escape key handler - closes topmost modal
  useEffect(() => {
    if (modals.length === 0) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        const topModal = modals.at(-1);
        topModal?.onClose?.();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [modals]);

  // Memoize context value to prevent unnecessary re-renders in consumers
  const contextValue = useMemo(
    () => ({
      modalRoot: resolvedModalRoot,
      modalStack,
      toastRoot: resolvedToastRoot,
      toastStack,
    }),
    [resolvedModalRoot, modalStack, resolvedToastRoot, toastStack]
  );

  return (
    <OverlayContext.Provider value={contextValue}>
      {children}

      {/* Modal stack - rendered in portal */}
      {modals.length > 0 && (
        <FloatingPortal root={resolvedModalRoot}>
          {modals.map(({ id, component: Component, data }) => (
            <Component key={id} data={data} />
          ))}
        </FloatingPortal>
      )}

      {/* Toast stack - rendered in portal */}
      {toasts.length > 0 && (
        <FloatingPortal root={resolvedToastRoot}>
          <div className="pointer-events-none fixed bottom-6 left-1/2 z-toast flex -translate-x-1/2 flex-col-reverse items-center gap-3">
            {toasts.map(({ id, component: Component, onClose, ...props }) => (
              <div key={id} className="pointer-events-auto">
                <Component onClose={onClose} {...props} />
              </div>
            ))}
          </div>
        </FloatingPortal>
      )}
    </OverlayContext.Provider>
  );
};
