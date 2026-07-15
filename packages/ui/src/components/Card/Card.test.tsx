/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../Button";
import { Card } from ".";

describe("Card", () => {
  it("renders as a div element", () => {
    render(<Card data-testid="card">Content</Card>);
    expect(screen.getByTestId("card").tagName).toBe("DIV");
  });

  it("renders children", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("forwards ref", () => {
    const ref = vi.fn();
    render(<Card ref={ref}>Content</Card>);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it("applies default classes", () => {
    render(<Card data-testid="card">Content</Card>);
    const card = screen.getByTestId("card");
    expect(card).toHaveClass("rounded-xl");
    expect(card).toHaveClass("border");
    expect(card).toHaveClass("shadow");
    expect(card).toHaveClass("p-6");
  });

  it("does not apply flex-col by default", () => {
    render(<Card data-testid="card">Content</Card>);
    const card = screen.getByTestId("card");
    expect(card).not.toHaveClass("flex");
    expect(card).not.toHaveClass("flex-col");
  });

  it("merges custom className", () => {
    render(
      <Card data-testid="card" className="custom-class">
        Content
      </Card>
    );
    const card = screen.getByTestId("card");
    expect(card).toHaveClass("custom-class");
    expect(card).toHaveClass("rounded-xl");
  });
});

describe("Card with title", () => {
  it("renders title in header", () => {
    render(<Card title="My Title">Content</Card>);
    expect(screen.getByText("My Title")).toBeInTheDocument();
  });

  it("renders title with font-semibold", () => {
    render(
      <Card title="My Title" data-testid="card">
        Content
      </Card>
    );
    const titleElement = screen.getByText("My Title");
    // The title is wrapped in a div with font-semibold
    expect(titleElement).toHaveClass("font-semibold");
  });

  it("renders header as semantic header element", () => {
    render(<Card title="My Title">Content</Card>);
    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass("mb-4");
  });

  it("renders ReactNode as title", () => {
    render(<Card title={<span data-testid="custom-title">Custom</span>}>Content</Card>);
    expect(screen.getByTestId("custom-title")).toBeInTheDocument();
  });
});

describe("Card with headerAction", () => {
  it("renders headerAction", () => {
    render(
      <Card title="Title" headerAction={<Button>Action</Button>}>
        Content
      </Card>
    );
    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
  });

  it("renders headerAction without title", () => {
    render(<Card headerAction={<Button>Action</Button>}>Content</Card>);
    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
  });

  it("positions headerAction with shrink-0", () => {
    render(
      <Card title="Title" headerAction={<Button data-testid="action">Action</Button>}>
        Content
      </Card>
    );
    const actionWrapper = screen.getByTestId("action").parentElement;
    expect(actionWrapper).toHaveClass("shrink-0");
  });
});

describe("Card without header", () => {
  it("does not render header element when no title or headerAction", () => {
    render(<Card>Content</Card>);
    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
  });
});

describe("Interactive Card (onClick)", () => {
  it("adds role=button and tabIndex when onClick is provided", () => {
    render(
      <Card data-testid="card" onClick={() => {}}>
        Content
      </Card>
    );
    const card = screen.getByTestId("card");
    expect(card).toHaveAttribute("role", "button");
    expect(card).toHaveAttribute("tabindex", "0");
  });

  it("does not add role or tabIndex without onClick", () => {
    render(<Card data-testid="card">Content</Card>);
    const card = screen.getByTestId("card");
    expect(card).not.toHaveAttribute("role");
    expect(card).not.toHaveAttribute("tabindex");
  });

  it("applies interactive classes when onClick is provided", () => {
    render(
      <Card data-testid="card" onClick={() => {}}>
        Content
      </Card>
    );
    const card = screen.getByTestId("card");
    expect(card).toHaveClass("cursor-pointer");
    expect(card).toHaveClass("transition-colors");
  });

  it("does not apply interactive classes without onClick", () => {
    render(<Card data-testid="card">Content</Card>);
    const card = screen.getByTestId("card");
    expect(card).not.toHaveClass("cursor-pointer");
  });

  it("fires onClick on click", async () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Content</Card>);
    await userEvent.click(screen.getByText("Content"));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("fires onClick on Enter key", async () => {
    const handleClick = vi.fn();
    render(
      <Card data-testid="card" onClick={handleClick}>
        Content
      </Card>
    );
    screen.getByTestId("card").focus();
    await userEvent.keyboard("{Enter}");
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("fires onClick on Space key", async () => {
    const handleClick = vi.fn();
    render(
      <Card data-testid="card" onClick={handleClick}>
        Content
      </Card>
    );
    screen.getByTestId("card").focus();
    await userEvent.keyboard(" ");
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("does not fire onClick on other keys", async () => {
    const handleClick = vi.fn();
    render(
      <Card data-testid="card" onClick={handleClick}>
        Content
      </Card>
    );
    screen.getByTestId("card").focus();
    await userEvent.keyboard("a");
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("calls custom onKeyDown alongside keyboard activation", async () => {
    const handleClick = vi.fn();
    const handleKeyDown = vi.fn();
    render(
      <Card data-testid="card" onClick={handleClick} onKeyDown={handleKeyDown}>
        Content
      </Card>
    );
    screen.getByTestId("card").focus();
    await userEvent.keyboard("{Enter}");
    expect(handleClick).toHaveBeenCalledOnce();
    expect(handleKeyDown).toHaveBeenCalledOnce();
  });
});
