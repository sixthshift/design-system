/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Message, MessageActions, MessageBody, MessageDescription, MessageIcon, MessageTitle } from ".";

describe("Message", () => {
  describe("rendering", () => {
    it("renders a polite live region by default", () => {
      render(<Message>Content</Message>);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("renders children", () => {
      render(<Message>Alert message</Message>);
      expect(screen.getByText("Alert message")).toBeInTheDocument();
    });

    it("forwards ref", () => {
      const ref = vi.fn();
      render(<Message ref={ref}>Content</Message>);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    });
  });

  describe("simple API", () => {
    it("renders title when provided", () => {
      render(<Message title="Warning">Content</Message>);
      expect(screen.getByText("Warning")).toBeInTheDocument();
    });

    it("renders icon when provided", () => {
      render(<Message icon={<span data-testid="icon">!</span>}>Content</Message>);
      expect(screen.getByTestId("icon")).toBeInTheDocument();
    });

    it("renders actions last in the body, outside the description", () => {
      render(
        <Message title="Title" icon={<span>!</span>} actions={<button type="button">Retry</button>}>
          Content
        </Message>
      );
      const button = screen.getByRole("button", { name: "Retry" });
      const description = screen.getByText("Content");
      const actions = button.parentElement as HTMLElement;
      expect(description).not.toContainElement(button);
      expect(actions.parentElement).toBe(description.parentElement);
      expect(actions.parentElement?.lastElementChild).toBe(actions);
    });

    it("renders no actions row when actions is omitted", () => {
      render(<Message title="Title">Content</Message>);
      expect(screen.getByText("Content").nextElementSibling).toBeNull();
    });
  });

  describe("intents", () => {
    it("applies neutral intent by default", () => {
      render(<Message>Content</Message>);
      expect(screen.getByRole("status")).toHaveAttribute("data-intent", "neutral");
    });

    it("applies success intent", () => {
      render(<Message intent="success">Content</Message>);
      expect(screen.getByRole("status")).toHaveAttribute("data-intent", "success");
    });

    it("applies warning intent", () => {
      render(<Message intent="warning">Content</Message>);
      expect(screen.getByRole("status")).toHaveAttribute("data-intent", "warning");
    });

    it("applies danger intent", () => {
      render(<Message intent="danger">Content</Message>);
      expect(screen.getByRole("alert")).toHaveAttribute("data-intent", "danger");
    });

    it("falls back to the status role for an intent the library has never heard of", () => {
      // "info" is outside the closed `MessageIntentName` union but legal under
      // the widened `MessageIntent` type — a consumer-defined intent should
      // still render, and must not resolve to an undefined role.
      render(<Message intent="info">Content</Message>);
      expect(screen.getByRole("status")).toHaveAttribute("data-intent", "info");
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("applies brand intent with the status role", () => {
      render(<Message intent="brand">Content</Message>);
      expect(screen.getByRole("status")).toHaveAttribute("data-intent", "brand");
    });

    it("keeps the assertive role for danger only", () => {
      const { unmount } = render(<Message intent="danger">Content</Message>);
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      unmount();

      for (const intent of ["neutral", "success", "warning"] as const) {
        const view = render(<Message intent={intent}>Content</Message>);
        expect(screen.getByRole("status")).toBeInTheDocument();
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        view.unmount();
      }
    });
  });

  describe("sizes", () => {
    it("applies default size", () => {
      render(<Message>Content</Message>);
      expect(screen.getByRole("status")).toHaveClass("p-4");
    });

    it("applies sm size", () => {
      render(<Message size="sm">Content</Message>);
      expect(screen.getByRole("status")).toHaveClass("p-3");
      expect(screen.getByRole("status")).toHaveClass("text-xs");
    });

    it("exposes the size as data-size, defaulting to md", () => {
      const { unmount } = render(<Message>Content</Message>);
      expect(screen.getByRole("status")).toHaveAttribute("data-size", "md");
      unmount();
      render(<Message size="sm">Content</Message>);
      expect(screen.getByRole("status")).toHaveAttribute("data-size", "sm");
    });
  });

  describe("styling", () => {
    it("applies base classes", () => {
      render(<Message>Content</Message>);
      const message = screen.getByRole("status");
      expect(message).toHaveClass("rounded-lg");
      expect(message).toHaveClass("border");
      expect(message).toHaveClass("text-sm");
    });

    it("merges custom className", () => {
      render(<Message className="custom-class">Content</Message>);
      const message = screen.getByRole("status");
      expect(message).toHaveClass("custom-class");
      expect(message).toHaveClass("rounded-lg");
    });
  });

  describe("brand", () => {
    it("renders data-brand and no bare brand attribute", () => {
      render(<Message brand="mint">Content</Message>);
      const message = screen.getByRole("status");
      expect(message).toHaveAttribute("data-brand", "mint");
      expect(message).not.toHaveAttribute("brand");
    });

    it("renders no data-brand when brand is omitted", () => {
      render(<Message>Content</Message>);
      expect(screen.getByRole("status")).not.toHaveAttribute("data-brand");
    });
  });
});

describe("MessageIcon", () => {
  it("renders children", () => {
    render(
      <Message>
        <MessageIcon>
          <span data-testid="icon">!</span>
        </MessageIcon>
        <MessageBody>
          <MessageDescription>Content</MessageDescription>
        </MessageBody>
      </Message>
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });
});

describe("MessageBody", () => {
  it("renders children", () => {
    render(
      <Message>
        <MessageBody>
          <MessageDescription>Content text</MessageDescription>
        </MessageBody>
      </Message>
    );
    expect(screen.getByText("Content text")).toBeInTheDocument();
  });
});

describe("MessageTitle", () => {
  it("renders children", () => {
    render(
      <Message>
        <MessageBody>
          <MessageTitle>Title text</MessageTitle>
          <MessageDescription>Content</MessageDescription>
        </MessageBody>
      </Message>
    );
    expect(screen.getByText("Title text")).toBeInTheDocument();
  });

  it("applies font-medium class", () => {
    render(
      <Message>
        <MessageBody>
          <MessageTitle data-testid="title">Title</MessageTitle>
          <MessageDescription>Content</MessageDescription>
        </MessageBody>
      </Message>
    );
    expect(screen.getByTestId("title")).toHaveClass("font-medium");
  });
});

describe("MessageActions", () => {
  it("is detected as a compound part", () => {
    render(
      <Message>
        <MessageActions data-testid="actions">
          <button type="button">Undo</button>
        </MessageActions>
      </Message>
    );
    const actions = screen.getByTestId("actions");
    // Not wrapped in the simple API's MessageBody/MessageDescription.
    expect(actions.parentElement).toBe(screen.getByRole("status"));
  });

  it("wraps its row and carries no opacity", () => {
    render(
      <Message>
        <MessageBody>
          <MessageActions data-testid="actions" />
        </MessageBody>
      </Message>
    );
    const actions = screen.getByTestId("actions");
    expect(actions).toHaveClass("flex", "flex-wrap", "gap-2", "mt-2");
    expect(actions.className).not.toMatch(/opacity/);
  });
});

describe("MessageDescription", () => {
  it("renders children", () => {
    render(
      <Message>
        <MessageBody>
          <MessageDescription>Description text</MessageDescription>
        </MessageBody>
      </Message>
    );
    expect(screen.getByText("Description text")).toBeInTheDocument();
  });
});

describe("Message compound components", () => {
  it("renders full compound structure", () => {
    render(
      <Message>
        <MessageIcon>
          <span data-testid="icon">!</span>
        </MessageIcon>
        <MessageBody>
          <MessageTitle>Alert Title</MessageTitle>
          <MessageDescription>Alert description</MessageDescription>
        </MessageBody>
      </Message>
    );

    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByText("Alert Title")).toBeInTheDocument();
    expect(screen.getByText("Alert description")).toBeInTheDocument();
  });
});
