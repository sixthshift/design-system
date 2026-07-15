/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./Button";

describe("Button", () => {
  describe("rendering", () => {
    it("renders with children", () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
    });

    it("renders as a button element by default", () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole("button")).toBeInstanceOf(HTMLButtonElement);
    });

    it("forwards ref to the button element", () => {
      const ref = vi.fn();
      render(<Button ref={ref}>Button</Button>);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
    });

    it("spreads additional props to the button", () => {
      render(<Button data-testid="custom-button">Button</Button>);
      expect(screen.getByTestId("custom-button")).toBeInTheDocument();
    });
  });

  describe("variants", () => {
    it.each(["solid", "outline", "ghost", "link"] as const)("renders %s variant", (variant) => {
      render(<Button variant={variant}>Button</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("applies default variant (solid) when not specified", () => {
      render(<Button>Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("shadow");
    });
  });

  describe("intents", () => {
    it.each(["neutral", "danger", "success", "warning"] as const)("renders %s intent", (intent) => {
      render(<Button intent={intent}>Button</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });

  describe("sizes", () => {
    it.each(["default", "sm", "lg", "xl", "icon"] as const)("renders %s size", (size) => {
      render(<Button size={size}>Button</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("applies correct height class for sm size", () => {
      render(<Button size="sm">Button</Button>);
      expect(screen.getByRole("button")).toHaveClass("h-8");
    });

    it("applies correct height class for lg size", () => {
      render(<Button size="lg">Button</Button>);
      expect(screen.getByRole("button")).toHaveClass("h-10");
    });
  });

  describe("disabled state", () => {
    it("is not disabled by default", () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole("button")).not.toBeDisabled();
    });

    it("can be disabled", () => {
      render(<Button disabled>Button</Button>);
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("does not call onClick when disabled", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Button
        </Button>
      );

      await user.click(screen.getByRole("button"));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("loading state", () => {
    it("is not loading by default", () => {
      render(<Button>Button</Button>);
      expect(screen.queryByRole("button")?.querySelector("svg.animate-spin")).not.toBeInTheDocument();
    });

    it("shows spinner when loading", () => {
      render(<Button loading>Button</Button>);
      const spinner = screen.getByRole("button").querySelector("svg.animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    it("is disabled when loading", () => {
      render(<Button loading>Button</Button>);
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("still shows children when loading", () => {
      render(<Button loading>Loading text</Button>);
      expect(screen.getByRole("button", { name: /Loading text/ })).toBeInTheDocument();
    });

    it("does not call onClick when loading", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <Button loading onClick={handleClick}>
          Button
        </Button>
      );

      await user.click(screen.getByRole("button"));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("asChild", () => {
    it("renders child element when asChild is true", () => {
      render(
        <Button asChild>
          <a href="/test">Link</a>
        </Button>
      );
      const link = screen.getByRole("link", { name: "Link" });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/test");
    });

    it("applies button styles to child element", () => {
      render(
        <Button asChild variant="solid">
          <a href="/test">Link</a>
        </Button>
      );
      const link = screen.getByRole("link");
      expect(link).toHaveClass("inline-flex");
    });
  });

  describe("interactions", () => {
    it("calls onClick when clicked", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Button</Button>);

      await user.click(screen.getByRole("button"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("can be focused", async () => {
      const user = userEvent.setup();
      render(<Button>Button</Button>);

      await user.tab();
      expect(screen.getByRole("button")).toHaveFocus();
    });

    it("can be activated with keyboard", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Button</Button>);

      await user.tab();
      await user.keyboard("{Enter}");
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("can be activated with space", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Button</Button>);

      await user.tab();
      await user.keyboard(" ");
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("className merging", () => {
    it("merges custom className with default classes", () => {
      render(<Button className="custom-class">Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
      expect(button).toHaveClass("inline-flex");
    });
  });
});
