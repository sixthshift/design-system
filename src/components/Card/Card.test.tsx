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
    expect(card).toHaveClass("p-4");
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

  it("renders the header row above the content", () => {
    render(<Card title="My Title">Content</Card>);
    const header = screen.getByText("My Title").parentElement;
    expect(header).toHaveClass("mb-4");
  });

  it("does not make the header a banner landmark", () => {
    // A <header> at the top level of a plain <div> is a banner, so two titled
    // cards on one page would claim two page banners.
    render(
      <>
        <Card title="One">Content</Card>
        <Card title="Two">Content</Card>
      </>
    );
    expect(screen.queryAllByRole("banner")).toHaveLength(0);
  });

  it("scales header spacing with size", () => {
    const { rerender } = render(<Card title="T" size="xs" />);
    expect(screen.getByText("T").parentElement).toHaveClass("mb-2", "gap-2");
    rerender(<Card title="T" size="xl" />);
    expect(screen.getByText("T").parentElement).toHaveClass("mb-6", "gap-4");
  });

  it("renders ReactNode as title", () => {
    render(<Card title={<span data-testid="custom-title">Custom</span>}>Content</Card>);
    expect(screen.getByTestId("custom-title")).toBeInTheDocument();
  });
});

describe("Card size", () => {
  // The ramp is 8 / 12 / 16 / 24 / 32px, with radius never exceeding padding.
  const ramp = [
    { size: "xs", padding: "p-2", radius: "rounded-md" },
    { size: "sm", padding: "p-3", radius: "rounded-lg" },
    { size: "md", padding: "p-4", radius: "rounded-xl" },
    { size: "lg", padding: "p-6", radius: "rounded-xl" },
    { size: "xl", padding: "p-8", radius: "rounded-2xl" },
  ] as const;

  it.for(ramp)("$size pairs $padding with $radius", ({ size, padding, radius }) => {
    render(
      <Card data-testid="card" size={size}>
        Content
      </Card>
    );
    const card = screen.getByTestId("card");
    expect(card).toHaveClass(padding);
    expect(card).toHaveClass(radius);
  });

  it("defaults to md", () => {
    render(<Card data-testid="card">Content</Card>);
    expect(screen.getByTestId("card")).toHaveClass("p-4", "rounded-xl");
  });

  it("does not set a font size at any step, so typography presets win", () => {
    for (const { size } of ramp) {
      const { container, unmount } = render(<Card size={size}>Content</Card>);
      expect(container.firstElementChild?.className).not.toMatch(/\btext-(xs|sm|base|lg|xl)\b/);
      unmount();
    }
  });

  it("lets className override the ramp's padding", () => {
    render(
      <Card data-testid="card" size="lg" className="p-0">
        Content
      </Card>
    );
    const card = screen.getByTestId("card");
    expect(card).toHaveClass("p-0");
    expect(card).not.toHaveClass("p-6");
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
  it("does not render a header row when no title or headerAction", () => {
    render(
      <Card data-testid="card">
        <p>Content</p>
      </Card>
    );
    // The paragraph is the card's only child; no header wrapper precedes it.
    expect(screen.getByTestId("card").children).toHaveLength(1);
    expect(screen.getByTestId("card").firstElementChild?.tagName).toBe("P");
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
