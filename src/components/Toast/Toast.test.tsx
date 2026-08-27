/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Toast, type ToastProps } from "./Toast";

// Helper to wait for animation
const waitForAnimation = () => new Promise((r) => setTimeout(r, 50));

// Helper to trigger animationend event (jsdom doesn't fire CSS animation events)
const triggerAnimationEnd = (element: Element) => {
  element.dispatchEvent(new Event("animationend", { bubbles: true }));
};

// Use standalone={false} in tests to render inline instead of portal
const renderToast = (props: ToastProps & { "data-testid"?: string }) => render(<Toast standalone={false} {...props} />);

describe("Toast", () => {
  describe("rendering", () => {
    it("renders with title", async () => {
      renderToast({ title: "Notification", onClose: () => {} });
      await waitForAnimation();
      expect(screen.getByText("Notification")).toBeInTheDocument();
    });

    it("renders with children as description", async () => {
      renderToast({
        title: "Title",
        onClose: () => {},
        children: "Description text",
      });
      await waitForAnimation();
      expect(screen.getByText("Description text")).toBeInTheDocument();
    });

    it("renders with icon", async () => {
      renderToast({
        title: "Title",
        icon: <span data-testid="icon">!</span>,
        onClose: () => {},
      });
      await waitForAnimation();
      expect(screen.getByTestId("icon")).toBeInTheDocument();
    });

    it("applies shadow class", async () => {
      renderToast({
        title: "Title",
        onClose: () => {},
        "data-testid": "toast",
      });
      await waitForAnimation();
      expect(screen.getByTestId("toast")).toHaveClass("shadow-lg");
    });

    it("applies max-width class", async () => {
      renderToast({
        title: "Title",
        onClose: () => {},
        "data-testid": "toast",
      });
      await waitForAnimation();
      expect(screen.getByTestId("toast")).toHaveClass("max-w-sm");
    });
  });

  describe("intents", () => {
    it("renders neutral intent by default", async () => {
      renderToast({ title: "Title", onClose: () => {} });
      await waitForAnimation();
      // Message picks the live-region role from the intent: polite for
      // everything except danger. The colour itself is no longer a class —
      // `data-intent` selects a cell in recipes/message.css.
      expect(screen.getByRole("status")).toHaveAttribute("data-intent", "neutral");
    });

    it("renders success intent", async () => {
      renderToast({ intent: "success", title: "Title", onClose: () => {} });
      await waitForAnimation();
      expect(screen.getByRole("status")).toHaveAttribute("data-intent", "success");
    });

    it("renders warning intent", async () => {
      renderToast({ intent: "warning", title: "Title", onClose: () => {} });
      await waitForAnimation();
      expect(screen.getByRole("status")).toHaveAttribute("data-intent", "warning");
    });

    it("renders danger intent", async () => {
      renderToast({ intent: "danger", title: "Title", onClose: () => {} });
      await waitForAnimation();
      expect(screen.getByRole("alert")).toHaveAttribute("data-intent", "danger");
    });
  });

  describe("close button", () => {
    it("renders dismiss button when onClose is provided", async () => {
      renderToast({ title: "Title", onClose: () => {} });
      await waitForAnimation();
      expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
    });

    it("does not render dismiss button when onClose is not provided", async () => {
      renderToast({ title: "Title" });
      await waitForAnimation();
      expect(screen.queryByRole("button", { name: "Dismiss" })).not.toBeInTheDocument();
    });

    it("calls onClose when dismiss button is clicked", async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      renderToast({
        title: "Title",
        onClose: handleClose,
        "data-testid": "toast",
      });
      await waitForAnimation();

      await user.click(screen.getByRole("button", { name: "Dismiss" }));
      // Trigger exit animation end (jsdom doesn't fire CSS animation events)
      const toast = screen.getByTestId("toast");
      triggerAnimationEnd(toast);
      await waitForAnimation();

      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("action button", () => {
    it("renders action button when action prop is provided", async () => {
      renderToast({ title: "Title", action: "Undo", onClose: () => {} });
      await waitForAnimation();
      expect(screen.getByRole("button", { name: "Undo" })).toBeInTheDocument();
    });

    it("does not render action button when action is not provided", async () => {
      renderToast({ title: "Title", onClose: () => {} });
      await waitForAnimation();
      // Only dismiss button should exist
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(1);
      expect(buttons[0]).toHaveAccessibleName("Dismiss");
    });

    it("calls onAction when action button is clicked", async () => {
      const user = userEvent.setup();
      const handleAction = vi.fn();
      renderToast({
        title: "Title",
        action: "Undo",
        onAction: handleAction,
        onClose: () => {},
      });
      await waitForAnimation();

      await user.click(screen.getByRole("button", { name: "Undo" }));
      expect(handleAction).toHaveBeenCalledTimes(1);
    });
  });

  describe("styling", () => {
    it("merges custom className", async () => {
      renderToast({
        title: "Title",
        className: "custom-class",
        onClose: () => {},
        "data-testid": "toast",
      });
      await waitForAnimation();
      const toast = screen.getByTestId("toast");
      expect(toast).toHaveClass("custom-class");
      expect(toast).toHaveClass("shadow-lg");
    });

    it("applies positioning classes when standalone", async () => {
      render(<Toast standalone={true} title="Title" onClose={() => {}} data-testid="toast" />);
      await waitForAnimation();
      const toast = screen.getByTestId("toast");
      expect(toast).toHaveClass("fixed");
      expect(toast).toHaveClass("bottom-6");
    });

    it("does not apply positioning classes when not standalone", async () => {
      renderToast({
        title: "Title",
        onClose: () => {},
        "data-testid": "toast",
      });
      await waitForAnimation();
      const toast = screen.getByTestId("toast");
      expect(toast).not.toHaveClass("fixed");
    });
  });
});
