import { FloatingPortal, type FloatingPortalProps } from "@floating-ui/react";
import { type StackItem, useStack } from "@sixthshift/design-system/hooks";
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
  modalRoot?: FloatingPortalProps["root"];
  modalStack: ReturnType<typeof useStack<OverlayStackItem>>;
  toastRoot?: FloatingPortalProps["root"];
  toastStack: ReturnType<typeof useStack<OverlayStackItem>>;
};

/**
 * `root` omitted when the caller gave none, rather than passed as `undefined`
 * or `null`. The distinction is load-bearing: `FloatingPortal` bails out of
 * creating its portal node entirely on an explicit `null` ("wait for the root
 * to exist"), and only a missing `root` falls through to `document.body`.
 */
const rootProp = (root: FloatingPortalProps["root"] | undefined) => (root === undefined ? {} : { root });

const OverlayContext = createContext<OverlayContextType>(undefined as unknown as OverlayContextType);
export const useOverlayContext = () => useContext(OverlayContext);

export const OverlayProvider = ({ modal: modalRoot, toast: toastRoot, children }: PropsWithChildren<OverlayContextProps>) => {
  // The roots pass through unresolved, deliberately. Defaulting them to
  // `document.body` here read the DOM during render, which threw the whole
  // tree under SSR — and it bought nothing: `FloatingPortal` already falls
  // back to `document.body` when no `root` is given, on the client, where a
  // body exists. Both portals below are behind a non-empty stack, and both
  // stacks start empty, so nothing portals on the server either way.
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
      modalRoot,
      modalStack,
      toastRoot,
      toastStack,
    }),
    [modalRoot, modalStack, toastRoot, toastStack]
  );

  return (
    <OverlayContext.Provider value={contextValue}>
      {children}

      {/* Modal stack - rendered in portal */}
      {modals.length > 0 && (
        <FloatingPortal {...rootProp(modalRoot)}>
          {modals.map(({ id, component: Component, data }) => (
            <Component key={id} data={data} />
          ))}
        </FloatingPortal>
      )}

      {/* Toast stack - rendered in portal */}
      {toasts.length > 0 && (
        <FloatingPortal {...rootProp(toastRoot)}>
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
