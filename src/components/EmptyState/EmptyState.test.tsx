/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  describe("rendering", () => {
    it("renders the message", () => {
      render(<EmptyState message="No items found" />);
      expect(screen.getByText("No items found")).toBeInTheDocument();
    });

    it("renders as a div", () => {
      const { container } = render(<EmptyState message="No items found" />);
      expect((container.firstChild as HTMLElement).tagName).toBe("DIV");
    });
  });

  describe("icon slot", () => {
    it("renders the icon when provided", () => {
      render(<EmptyState message="No items" icon={<svg data-testid="icon" />} />);
      expect(screen.getByTestId("icon")).toBeInTheDocument();
    });

    it("does not render an icon wrapper when icon is not provided", () => {
      const { container } = render(<EmptyState message="No items" />);
      expect(container.querySelector("div.text-fg-subtle")).not.toBeInTheDocument();
    });
  });

  describe("description slot", () => {
    it("renders the description when provided", () => {
      render(<EmptyState message="No results found" description="Try adjusting your search or filter criteria" />);
      expect(screen.getByText("Try adjusting your search or filter criteria")).toBeInTheDocument();
    });

    it("does not render a description when not provided", () => {
      render(<EmptyState message="No items" />);
      expect(screen.queryByText(/try adjusting/i)).not.toBeInTheDocument();
    });
  });

  describe("action slot", () => {
    it("renders the action when provided", () => {
      render(<EmptyState message="No tasks yet" action={<button type="button">Create Task</button>} />);
      expect(screen.getByRole("button", { name: "Create Task" })).toBeInTheDocument();
    });

    it("does not render an action when not provided", () => {
      render(<EmptyState message="No items" />);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("full slot combination", () => {
    it("renders icon, message, description and action together", () => {
      render(
        <EmptyState
          icon={<svg data-testid="icon" />}
          message="No tasks yet"
          description="Get started by creating your first task"
          action={<button type="button">Create Task</button>}
        />
      );
      expect(screen.getByTestId("icon")).toBeInTheDocument();
      expect(screen.getByText("No tasks yet")).toBeInTheDocument();
      expect(screen.getByText("Get started by creating your first task")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Create Task" })).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("renders a long message that would wrap", () => {
      const longMessage =
        "This is a very long empty state message that describes in great detail why there is no data to show and what the user might consider doing about it";
      render(<EmptyState message={longMessage} />);
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });
  });

  describe("className merging", () => {
    it("merges custom className with default classes", () => {
      const { container } = render(<EmptyState message="No items" className="custom-class" />);
      const root = container.firstChild as HTMLElement;
      expect(root).toHaveClass("custom-class");
      expect(root).toHaveClass("flex");
      expect(root).toHaveClass("flex-col");
    });
  });

  describe("prop forwarding", () => {
    it("spreads additional props onto the root element", () => {
      render(<EmptyState message="Nothing here" data-testid="empty-root" />);
      expect(screen.getByTestId("empty-root")).toBeInTheDocument();
    });

    it("forwards aria attributes onto the root element", () => {
      render(<EmptyState message="Nothing here" aria-label="No results" />);
      expect(screen.getByLabelText("No results")).toBeInTheDocument();
    });
  });
});
