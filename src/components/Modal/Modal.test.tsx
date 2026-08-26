/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Modal, ModalBody, ModalFooter, ModalHeader } from ".";

// Helper to wait for animation to complete
const waitForAnimation = () => new Promise((r) => setTimeout(r, 50));

// Helper to trigger animationend event (jsdom doesn't fire CSS animation events)
const triggerAnimationEnd = (element: Element) => {
  element.dispatchEvent(new Event("animationend", { bubbles: true }));
};

describe("Modal", () => {
  it("renders when mounted", async () => {
    render(
      <Modal onOpenChange={() => {}}>
        <ModalBody>Content</ModalBody>
      </Modal>
    );
    await waitForAnimation();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("has role='dialog'", async () => {
    render(
      <Modal onOpenChange={() => {}}>
        <ModalBody>Content</ModalBody>
      </Modal>
    );
    await waitForAnimation();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("has aria-modal='true'", async () => {
    render(
      <Modal onOpenChange={() => {}}>
        <ModalBody>Content</ModalBody>
      </Modal>
    );
    await waitForAnimation();
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });

  it("renders children", async () => {
    render(
      <Modal onOpenChange={() => {}}>
        <ModalBody>Modal body content</ModalBody>
      </Modal>
    );
    await waitForAnimation();
    expect(screen.getByText("Modal body content")).toBeInTheDocument();
  });

  it("forwards ref to the dialog panel", async () => {
    const ref = vi.fn();
    render(
      <Modal ref={ref} onOpenChange={() => {}}>
        <ModalBody>Content</ModalBody>
      </Modal>
    );
    await waitForAnimation();
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  describe("sizes", () => {
    it("renders with sm size", async () => {
      render(
        <Modal onOpenChange={() => {}} size="sm">
          <ModalBody>Content</ModalBody>
        </Modal>
      );
      await waitForAnimation();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("renders with md size (default)", async () => {
      render(
        <Modal onOpenChange={() => {}} size="md">
          <ModalBody>Content</ModalBody>
        </Modal>
      );
      await waitForAnimation();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("renders with lg size", async () => {
      render(
        <Modal onOpenChange={() => {}} size="lg">
          <ModalBody>Content</ModalBody>
        </Modal>
      );
      await waitForAnimation();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("renders with full size", async () => {
      render(
        <Modal onOpenChange={() => {}} size="full">
          <ModalBody>Content</ModalBody>
        </Modal>
      );
      await waitForAnimation();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });
});

describe("ModalHeader", () => {
  it("renders header content", async () => {
    render(
      <Modal onOpenChange={() => {}}>
        <ModalHeader>
          <h3>Modal Header</h3>
        </ModalHeader>
        <ModalBody>Content</ModalBody>
      </Modal>
    );
    await waitForAnimation();
    expect(screen.getByText("Modal Header")).toBeInTheDocument();
  });

  it("applies default classes", async () => {
    render(
      <Modal onOpenChange={() => {}}>
        <ModalHeader data-testid="header">Header</ModalHeader>
        <ModalBody>Content</ModalBody>
      </Modal>
    );
    await waitForAnimation();
    const header = screen.getByTestId("header");
    expect(header).toHaveClass("flex");
    expect(header).toHaveClass("flex-col");
    expect(header).toHaveClass("p-6");
  });

  it("merges custom className", async () => {
    render(
      <Modal onOpenChange={() => {}}>
        <ModalHeader data-testid="header" className="custom-class">
          Header
        </ModalHeader>
        <ModalBody>Content</ModalBody>
      </Modal>
    );
    await waitForAnimation();
    expect(screen.getByTestId("header")).toHaveClass("custom-class");
  });
});

describe("closable", () => {
  it("shows a close button in the header when closable is true", async () => {
    render(
      <Modal onOpenChange={() => {}} closable>
        <ModalHeader>
          <h3>Title</h3>
        </ModalHeader>
        <ModalBody>Content</ModalBody>
      </Modal>
    );
    await waitForAnimation();
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("does not show a close button when closable is not set", async () => {
    render(
      <Modal onOpenChange={() => {}}>
        <ModalHeader>
          <h3>Title</h3>
        </ModalHeader>
        <ModalBody>Content</ModalBody>
      </Modal>
    );
    await waitForAnimation();
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(
      <Modal onOpenChange={handleClose} closable>
        <ModalHeader>
          <h3>Title</h3>
        </ModalHeader>
        <ModalBody>Content</ModalBody>
      </Modal>
    );
    await waitForAnimation();

    await user.click(screen.getByRole("button", { name: "Close" }));
    // Trigger exit animation
    const dialog = screen.getByRole("dialog");
    triggerAnimationEnd(dialog);
    await waitForAnimation();

    expect(handleClose).toHaveBeenCalled();
  });
});

describe("ModalBody", () => {
  it("renders body content", async () => {
    render(
      <Modal onOpenChange={() => {}}>
        <ModalBody>Body content here</ModalBody>
      </Modal>
    );
    await waitForAnimation();
    expect(screen.getByText("Body content here")).toBeInTheDocument();
  });

  it("applies default classes", async () => {
    render(
      <Modal onOpenChange={() => {}}>
        <ModalBody data-testid="body">Content</ModalBody>
      </Modal>
    );
    await waitForAnimation();
    const body = screen.getByTestId("body");
    expect(body).toHaveClass("flex-1");
    expect(body).toHaveClass("overflow-y-auto");
    expect(body).toHaveClass("p-6");
  });
});

describe("ModalFooter", () => {
  it("renders footer content", async () => {
    render(
      <Modal onOpenChange={() => {}}>
        <ModalBody>Content</ModalBody>
        <ModalFooter>Footer content</ModalFooter>
      </Modal>
    );
    await waitForAnimation();
    expect(screen.getByText("Footer content")).toBeInTheDocument();
  });

  it("applies default classes", async () => {
    render(
      <Modal onOpenChange={() => {}}>
        <ModalBody>Content</ModalBody>
        <ModalFooter data-testid="footer">Footer</ModalFooter>
      </Modal>
    );
    await waitForAnimation();
    const footer = screen.getByTestId("footer");
    expect(footer).toHaveClass("flex");
    expect(footer).toHaveClass("items-center");
    expect(footer).toHaveClass("p-6");
  });
});

describe("Modal composition", () => {
  it("renders full modal structure", async () => {
    render(
      <Modal onOpenChange={() => {}}>
        <ModalHeader>
          <h3>Title</h3>
        </ModalHeader>
        <ModalBody>Body content</ModalBody>
        <ModalFooter>
          <button type="button">Action</button>
        </ModalFooter>
      </Modal>
    );
    await waitForAnimation();

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Body content")).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();
  });

  it("calls onClose when clicking outside", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(
      <Modal onOpenChange={handleClose}>
        <ModalBody>Content</ModalBody>
      </Modal>
    );
    await waitForAnimation();

    // Click on the overlay (outside the modal)
    const overlay = document.querySelector(".bg-bg-overlay");
    if (overlay) {
      await user.click(overlay);
      // Trigger exit animation end (jsdom doesn't fire CSS animation events)
      const dialog = screen.getByRole("dialog");
      triggerAnimationEnd(dialog);
      await waitForAnimation();
    }

    expect(handleClose).toHaveBeenCalled();
  });
});
