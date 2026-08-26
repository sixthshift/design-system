/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Message, MessageBody, MessageDescription, MessageIcon, MessageTitle } from ".";

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
  });

  describe("intents", () => {
    it("applies neutral intent by default", () => {
      render(<Message>Content</Message>);
      expect(screen.getByRole("status")).toHaveClass("bg-bg-normal");
    });

    it("applies success intent", () => {
      render(<Message intent="success">Content</Message>);
      expect(screen.getByRole("status")).toHaveClass("bg-bg-success-subtle");
    });

    it("applies warning intent", () => {
      render(<Message intent="warning">Content</Message>);
      expect(screen.getByRole("status")).toHaveClass("bg-bg-warning-subtle");
    });

    it("applies danger intent", () => {
      render(<Message intent="danger">Content</Message>);
      expect(screen.getByRole("alert")).toHaveClass("bg-bg-danger-subtle");
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
