import { ModalContextProvider, type ModalProps, type OnClose } from "@sixthshift/ui/modal";
import { type ComponentType, type ReactNode, Suspense, useCallback, useId, useRef } from "react";
import { useOverlayContext } from "../OverlayContext";

// =============================================================================
// Types
// =============================================================================

/** Props passed to modal components */
export type ModalComponentProps<TData = undefined> = {
  /** Close this modal */
  onClose: OnClose;
  /** Close all open modals */
  closeAll: () => void;
  /** Live data passed via update() */
  data: TData;
} & Omit<ModalProps, "onOpenChange" | "children">;

/** Modal options passed to openModal */
export type OpenModalOptions<TData = undefined> = Omit<ModalProps, "onOpenChange" | "children"> & {
  /** Fallback to show while lazy content is loading */
  suspenseFallback?: ReactNode;
  /** Initial data passed to the modal component */
  data?: TData;
};

// =============================================================================
// Hook
// =============================================================================

export const useModal = () => {
  const {
    modalStack: [, dispatch],
  } = useOverlayContext();

  const baseId = useId();
  const counterRef = useRef(0);

  /**
   * Close all open modals.
   */
  const closeAllModals = useCallback(() => {
    dispatch({ type: "clear", transition: { duration: 300 } });
  }, [dispatch]);

  /**
   * Open a modal by passing a component that renders a Modal.
   *
   * The component receives `onClose`, `closeAll`, and any options passed as props.
   * It should render a `<Modal>` with its content.
   *
   * Supports lazy-loaded components via React.lazy().
   *
   * @example
   * ```tsx
   * const { openModal } = useModal();
   *
   * // Inline component — Modal picks up the close handler from context, no prop needed.
   * openModal(({ onClose, closeAll }) => (
   *   <Modal>
   *     <Modal.Header>My Modal</Modal.Header>
   *     <Modal.Body>Content</Modal.Body>
   *     <Modal.Footer>
   *       <Button onClick={onClose}>Close</Button>
   *       <Button onClick={closeAll}>Close All</Button>
   *     </Modal.Footer>
   *   </Modal>
   * ));
   *
   * // Named component
   * function ConfirmModal({ onClose, closeAll }: ModalComponentProps) {
   *   return (
   *     <Modal>
   *       <Modal.Header>Confirm</Modal.Header>
   *       <Modal.Body>Are you sure?</Modal.Body>
   *       <Modal.Footer>
   *         <Button onClick={closeAll}>Close All</Button>
   *       </Modal.Footer>
   *     </Modal>
   *   );
   * }
   * openModal(ConfirmModal);
   * ```
   */
  const openModal = useCallback(
    <TData = undefined>(Component: ComponentType<ModalComponentProps<TData>>, options: OpenModalOptions<TData> = {} as OpenModalOptions<TData>) => {
      const id = `${baseId}-${counterRef.current++}`;
      const { suspenseFallback = null, data: initialData, ...componentProps } = options;

      const closeModal: OnClose = () => {
        dispatch({ type: "remove", id, transition: { duration: 300 } });
      };

      const ModalWrapper = ({ data }: { data?: unknown }) => (
        <ModalContextProvider onClose={closeModal}>
          <Suspense fallback={suspenseFallback}>
            <Component onClose={closeModal} closeAll={closeAllModals} data={(data ?? initialData) as TData} {...componentProps} />
          </Suspense>
        </ModalContextProvider>
      );

      dispatch({
        type: "push",
        item: {
          id,
          component: ModalWrapper,
          onClose: closeModal,
          data: initialData,
        },
      });

      const update = (newData: TData) => {
        dispatch({ type: "update", item: { id, data: newData } });
      };

      return { id, closeModal, update };
    },
    [dispatch, baseId, closeAllModals]
  );

  return {
    openModal,
    closeAllModals,
  };
};
