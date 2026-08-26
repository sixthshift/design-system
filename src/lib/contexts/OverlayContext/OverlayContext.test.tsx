/// <reference types="@testing-library/jest-dom" />

import { Modal, ModalBody, ModalFooter, ModalHeader } from "@sixthshift/design-system/modal";
import { act, renderHook, render as rtlRender, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";
import type { ModalComponentProps } from "./hooks/useModal";
import { useModal } from "./hooks/useModal";
import { useToast } from "./hooks/useToast";
import { OverlayProvider, useOverlayContext } from "./OverlayContext";

// Helper: happy-dom (like jsdom) doesn't play real CSS animations, so
// usePresence's "entering"/"exiting" states never resolve on their own.
// Dispatch the animationend event it listens for, exactly as Modal.test.tsx does.
const triggerAnimationEnd = (element: Element) => {
  element.dispatchEvent(new Event("animationend", { bubbles: true }));
};

const wrapper = ({ children }: PropsWithChildren) => <OverlayProvider>{children}</OverlayProvider>;

type ConfirmModalData = { label: string };

/** A modal whose footer exposes the `onClose`/`closeAll` props directly, mirroring useModal's own docstring example. */
const ConfirmModal = ({ onClose, closeAll, data }: ModalComponentProps<ConfirmModalData | undefined>) => (
  <Modal>
    <ModalHeader>
      <h3>{data?.label ?? "Confirm"}</h3>
    </ModalHeader>
    <ModalBody>Are you sure?</ModalBody>
    <ModalFooter>
      <button type="button" onClick={onClose}>
        Dismiss
      </button>
      <button type="button" onClick={closeAll}>
        Dismiss all
      </button>
    </ModalFooter>
  </Modal>
);

/** A modal that relies on Modal's own `closable` header (X) button instead of a footer button. */
const ClosableModal = () => (
  <Modal closable>
    <ModalHeader>
      <h3>Confirm</h3>
    </ModalHeader>
    <ModalBody>Are you sure?</ModalBody>
  </Modal>
);

const OpenModalButton = ({ label, buttonLabel = "Open modal" }: { label: string; buttonLabel?: string }) => {
  const { openModal } = useModal();
  return (
    <button type="button" onClick={() => openModal(ConfirmModal, { data: { label } })}>
      {buttonLabel}
    </button>
  );
};

const OpenClosableModalButton = () => {
  const { openModal } = useModal();
  return (
    <button type="button" onClick={() => openModal(ClosableModal)}>
      Open modal
    </button>
  );
};

const OpenToastButton = ({ duration, buttonLabel = "Open toast" }: { duration: number; buttonLabel?: string }) => {
  const { openToast } = useToast({ title: "Saved", children: "Your changes were saved.", duration });
  return (
    <button type="button" onClick={openToast}>
      {buttonLabel}
    </button>
  );
};

describe("useOverlayContext", () => {
  it("throws when used without an OverlayProvider ancestor", () => {
    // React logs the thrown render error to console.error; keep the test output clean.
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useModal())).toThrow();
    consoleSpy.mockRestore();
  });

  it("returns modal and toast stacks when used within an OverlayProvider", () => {
    const { result } = renderHook(() => useOverlayContext(), { wrapper });
    expect(result.current.modalStack[0]).toEqual([]);
    expect(result.current.toastStack[0]).toEqual([]);
  });
});

describe("useModal", () => {
  describe("openModal", () => {
    it("pushes a modal onto the stack and renders it", async () => {
      const user = userEvent.setup();
      rtlRender(<OpenModalButton label="First" />, { wrapper });

      await user.click(screen.getByRole("button", { name: "Open modal" }));

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("First")).toBeInTheDocument();
    });

    it("passes the initial data through to the modal component", async () => {
      const user = userEvent.setup();
      rtlRender(<OpenModalButton label="Delete item?" />, { wrapper });

      await user.click(screen.getByRole("button", { name: "Open modal" }));

      expect(screen.getByText("Delete item?")).toBeInTheDocument();
    });
  });

  describe("stacking order", () => {
    it("renders multiple modals simultaneously, in the order they were opened", () => {
      const { result } = renderHook(() => useModal(), { wrapper });

      act(() => {
        result.current.openModal(ConfirmModal, { data: { label: "First" } });
      });
      act(() => {
        result.current.openModal(ConfirmModal, { data: { label: "Second" } });
      });

      // The second (topmost) modal's own focus trap marks the first modal's
      // DOM aria-hidden, so `hidden: true` is needed to see both here.
      const dialogs = screen.getAllByRole("dialog", { hidden: true });
      expect(dialogs).toHaveLength(2);
      expect(dialogs[0]).toHaveTextContent("First");
      expect(dialogs[1]).toHaveTextContent("Second");
    });
  });

  describe("closing", () => {
    it("removes a modal from the stack via its close (X) button, after the exit animation completes", async () => {
      const user = userEvent.setup();
      rtlRender(<OpenClosableModalButton />, { wrapper });

      await user.click(screen.getByRole("button", { name: "Open modal" }));
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Close" }));
      triggerAnimationEnd(screen.getByRole("dialog"));

      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    });

    it("removes a modal from the stack via the onClose prop passed to the modal component", async () => {
      const user = userEvent.setup();
      rtlRender(<OpenModalButton label="First" />, { wrapper });

      await user.click(screen.getByRole("button", { name: "Open modal" }));
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Dismiss" }));

      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument(), { timeout: 2000 });
    });

    it("closeAll removes every modal in the stack", async () => {
      const { result } = renderHook(() => useModal(), { wrapper });

      act(() => {
        result.current.openModal(ConfirmModal, { data: { label: "First" } });
      });
      act(() => {
        result.current.openModal(ConfirmModal, { data: { label: "Second" } });
      });
      expect(screen.getAllByRole("dialog", { hidden: true })).toHaveLength(2);

      act(() => {
        result.current.closeAllModals();
      });

      await waitFor(() => expect(screen.queryAllByRole("dialog", { hidden: true })).toHaveLength(0), { timeout: 2000 });
    });
  });

  describe("escape key handling", () => {
    it("closes only the topmost modal when Escape is pressed", async () => {
      const user = userEvent.setup();
      const { result } = renderHook(() => useModal(), { wrapper });

      act(() => {
        result.current.openModal(ConfirmModal, { data: { label: "First" } });
      });
      act(() => {
        result.current.openModal(ConfirmModal, { data: { label: "Second" } });
      });
      expect(screen.getAllByRole("dialog", { hidden: true })).toHaveLength(2);

      await user.keyboard("{Escape}");

      await waitFor(() => expect(screen.getAllByRole("dialog", { hidden: true })).toHaveLength(1), { timeout: 2000 });
      expect(screen.getByRole("dialog", { hidden: true })).toHaveTextContent("First");
    });
  });

  describe("update", () => {
    it("updates the live data of an already-open modal", () => {
      const { result } = renderHook(() => useModal(), { wrapper });

      let update!: (data: ConfirmModalData) => void;
      act(() => {
        ({ update } = result.current.openModal(ConfirmModal, { data: { label: "Initial" } }));
      });
      expect(screen.getByText("Initial")).toBeInTheDocument();

      act(() => {
        update({ label: "Updated" });
      });

      expect(screen.queryByText("Initial")).not.toBeInTheDocument();
      expect(screen.getByText("Updated")).toBeInTheDocument();
    });
  });
});

describe("useToast", () => {
  describe("openToast", () => {
    it("pushes a toast onto the stack and renders it", async () => {
      const user = userEvent.setup();
      rtlRender(<OpenToastButton duration={0} />, { wrapper });

      await user.click(screen.getByRole("button", { name: "Open toast" }));

      expect(screen.getByText("Saved")).toBeInTheDocument();
      expect(screen.getByText("Your changes were saved.")).toBeInTheDocument();
    });

    it("renders the toast as non-standalone, positioned by the provider's own container", async () => {
      const user = userEvent.setup();
      rtlRender(<OpenToastButton duration={0} />, { wrapper });

      await user.click(screen.getByRole("button", { name: "Open toast" }));

      // A neutral toast is a polite live region (see Message).
      const message = screen.getByRole("status");
      const toastRoot = message.parentElement as HTMLElement;
      // OverlayContext positions the stack container; the Toast itself must not
      // also position itself, or the two "fixed" layouts would fight.
      expect(toastRoot).not.toHaveClass("fixed");

      const positionedContainer = toastRoot.parentElement?.parentElement as HTMLElement;
      expect(positionedContainer).toHaveClass("z-toast");
    });
  });

  describe("closeToast", () => {
    it("removes the toast after the exit animation completes", async () => {
      const user = userEvent.setup();
      rtlRender(<OpenToastButton duration={0} />, { wrapper });

      await user.click(screen.getByRole("button", { name: "Open toast" }));
      expect(screen.getByText("Saved")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Dismiss" }));
      triggerAnimationEnd(screen.getByRole("status"));

      await waitFor(() => expect(screen.queryByText("Saved")).not.toBeInTheDocument());
    });
  });

  describe("auto-dismiss", () => {
    it("does not auto-dismiss when duration is 0", async () => {
      const user = userEvent.setup();
      rtlRender(<OpenToastButton duration={0} />, { wrapper });

      await user.click(screen.getByRole("button", { name: "Open toast" }));
      expect(screen.getByText("Saved")).toBeInTheDocument();

      // Long enough that a real auto-dismiss timer (if any had been scheduled) would have fired.
      await new Promise((r) => setTimeout(r, 200));
      expect(screen.getByText("Saved")).toBeInTheDocument();
    });

    it("auto-dismisses after the given duration", async () => {
      const user = userEvent.setup();
      rtlRender(<OpenToastButton duration={50} />, { wrapper });

      await user.click(screen.getByRole("button", { name: "Open toast" }));
      expect(screen.getByText("Saved")).toBeInTheDocument();

      await new Promise((r) => setTimeout(r, 60));
      triggerAnimationEnd(screen.getByRole("status"));

      await waitFor(() => expect(screen.queryByText("Saved")).not.toBeInTheDocument());
    });
  });
});

describe("useToast prop freshness", () => {
  /**
   * Renders a toast whose action handler is swapped without changing any
   * JSON-serialisable prop. The old implementation memoised the props object
   * against JSON.stringify(props), and JSON.stringify drops functions — so this
   * key never changed and openToast fired the first handler forever.
   */
  const ToastWithAction = ({ onAction }: { onAction: () => void }) => {
    const { openToast } = useToast({ title: "Saved", action: "Undo", onAction, duration: 0 });
    return (
      <button type="button" onClick={openToast}>
        Open toast
      </button>
    );
  };

  it("uses the latest onAction handler even when no serialisable prop changed", async () => {
    const user = userEvent.setup();
    const first = vi.fn();
    const second = vi.fn();

    const { rerender } = rtlRender(<ToastWithAction onAction={first} />, { wrapper });

    // Swap only the function identity. Every other prop is byte-identical, so
    // a JSON-derived cache key cannot see this change.
    rerender(<ToastWithAction onAction={second} />);

    await user.click(screen.getByRole("button", { name: "Open toast" }));
    await user.click(screen.getByRole("button", { name: "Undo" }));

    expect(second).toHaveBeenCalledTimes(1);
    expect(first).not.toHaveBeenCalled();
  });

  it("still uses the original handler when it has not been replaced", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    rtlRender(<ToastWithAction onAction={onAction} />, { wrapper });

    await user.click(screen.getByRole("button", { name: "Open toast" }));
    await user.click(screen.getByRole("button", { name: "Undo" }));

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("keeps openToast referentially stable across re-renders", () => {
    const identities: Array<() => void> = [];
    const Probe = ({ title }: { title: string }) => {
      const { openToast } = useToast({ title, duration: 0 });
      identities.push(openToast);
      return null;
    };

    const { rerender } = rtlRender(<Probe title="a" />, { wrapper });
    rerender(<Probe title="a" />);

    // Stability is the reason the memo existed; it must survive the fix.
    expect(identities.length).toBeGreaterThanOrEqual(2);
    expect(identities[identities.length - 1]).toBe(identities[identities.length - 2]);
  });
});
