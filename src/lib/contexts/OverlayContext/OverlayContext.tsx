"use client";

import { FloatingPortal, type FloatingPortalProps } from "@floating-ui/react";
import { type StackItem, useStack } from "@sixthshift/design-system/hooks";
import { createContext, type FunctionComponent, type PropsWithChildren, useContext, useEffect, useMemo } from "react";
import { hasOpenEscapeLayer } from "../../../internal/escapeLayers";
import { ToastStack } from "./ToastStack";
import { toastStore as defaultToastStore, type ToastStore } from "./toastStore";

type OverlayContextProps = {
  modal?: FloatingPortalProps["root"];
  toast?: FloatingPortalProps["root"];
  /** The toast stack to render. Default: the app's one, which `toast()` opens onto. Hand in your own for a second bundle or a test. */
  toasts?: ToastStore;
  /** Merged over the toast stack's container classes, so an app can move it (above a bottom bar, into a corner). */
  toastClassName?: string;
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
  // `undefined` spelled out rather than an optional `?:` — the context value
  // below always sets the key, and `exactOptionalPropertyTypes` treats "absent"
  // and "present but undefined" as different types.
  modalRoot: FloatingPortalProps["root"] | undefined;
  modalStack: ReturnType<typeof useStack<OverlayStackItem>>;
  toastRoot: FloatingPortalProps["root"] | undefined;
  toastStore: ToastStore;
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

export const OverlayProvider = ({
  modal: modalRoot,
  toast: toastRoot,
  toasts: toastStore = defaultToastStore,
  toastClassName,
  children,
}: PropsWithChildren<OverlayContextProps>) => {
  // The roots pass through unresolved, deliberately. `"use client"` makes this a
  // Client Component, but a Client Component is still rendered once on the
  // server — defaulting to `document.body` here read the DOM at render scope and
  // threw "document is not defined" on the first App Router request, which
  // src/testing/stories.ssr.test.tsx and src/exports.ssr.test.tsx now catch. It
  // bought nothing either: `FloatingPortal` already falls back to
  // `document.body` when no `root` is given, and does it in an effect, on the
  // client, where a body exists. Both portals below are behind a non-empty
  // stack, and both stacks start empty, so nothing portals on the server anyway.
  //
  // Modals are a `useStack` here; toasts are a store outside React, so that
  // `toast()` works from code that is not a component.
  const modalStack = useStack<OverlayStackItem>([]);

  const [modals] = modalStack;

  // Global escape key handler - closes topmost modal
  useEffect(() => {
    if (modals.length === 0) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // A transient overlay open above the modal (a Select dropdown, a
        // Popover, a picker calendar) consumes this Escape via its own
        // dismiss handling — closing the modal too would double-fire.
        if (hasOpenEscapeLayer()) return;
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
      toastStore,
    }),
    [modalRoot, modalStack, toastRoot, toastStore]
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

      {/* Toast stack - portals itself, and only while it holds something */}
      <ToastStack store={toastStore} className={toastClassName} {...rootProp(toastRoot)} />
    </OverlayContext.Provider>
  );
};
