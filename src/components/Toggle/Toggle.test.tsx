/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Toggle } from "./Toggle";

describe("Toggle", () => {
  describe("rendering", () => {
    it("renders as a button with aria-pressed", () => {
      render(<Toggle>Bold</Toggle>);
      expect(screen.getByRole("button")).toHaveAttribute("aria-pressed");
    });

    it("forwards ref to the button element", () => {
      const ref = vi.fn();
      render(<Toggle ref={ref}>Bold</Toggle>);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
    });

    it("spreads additional props", () => {
      render(
        <Toggle data-testid="custom-toggle" aria-label="Bold">
          B
        </Toggle>
      );
      expect(screen.getByTestId("custom-toggle")).toHaveAttribute("aria-label", "Bold");
    });

    it("renders children", () => {
      render(<Toggle>Bold</Toggle>);
      expect(screen.getByRole("button")).toHaveTextContent("Bold");
    });
  });

  describe("pressed state", () => {
    it("is unpressed by default", () => {
      render(<Toggle>Bold</Toggle>);
      expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
    });

    it("reflects controlled pressed state", () => {
      render(<Toggle pressed={true}>Bold</Toggle>);
      expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
    });

    it("reflects controlled unpressed state", () => {
      render(<Toggle pressed={false}>Bold</Toggle>);
      expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
    });

    it("has data-state='on' when pressed", () => {
      render(<Toggle pressed={true}>Bold</Toggle>);
      expect(screen.getByRole("button")).toHaveAttribute("data-state", "on");
    });

    it("has data-state='off' when unpressed", () => {
      render(<Toggle pressed={false}>Bold</Toggle>);
      expect(screen.getByRole("button")).toHaveAttribute("data-state", "off");
    });

    it("supports defaultPressed for uncontrolled mode", () => {
      render(<Toggle defaultPressed={true}>Bold</Toggle>);
      expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
    });
  });

  describe("interactions", () => {
    it("toggles pressed state on click in uncontrolled mode", async () => {
      const user = userEvent.setup();
      render(<Toggle>Bold</Toggle>);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-pressed", "false");

      await user.click(button);
      expect(button).toHaveAttribute("aria-pressed", "true");

      await user.click(button);
      expect(button).toHaveAttribute("aria-pressed", "false");
    });

    it("calls onPressedChange when clicked", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Toggle onPressedChange={handleChange}>Bold</Toggle>);

      await user.click(screen.getByRole("button"));
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it("calls onPressedChange with false when toggling off", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <Toggle pressed={true} onPressedChange={handleChange}>
          Bold
        </Toggle>
      );

      await user.click(screen.getByRole("button"));
      expect(handleChange).toHaveBeenCalledWith(false);
    });

    it("does not toggle when disabled", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <Toggle disabled onPressedChange={handleChange}>
          Bold
        </Toggle>
      );

      await user.click(screen.getByRole("button"));
      expect(handleChange).not.toHaveBeenCalled();
    });

    it("can be focused", async () => {
      const user = userEvent.setup();
      render(<Toggle>Bold</Toggle>);

      await user.tab();
      expect(screen.getByRole("button")).toHaveFocus();
    });
  });

  describe("styling", () => {
    it("applies solid variant by default (matches Button defaults)", () => {
      render(<Toggle>Bold</Toggle>);
      expect(screen.getByRole("button")).toHaveClass("shadow");
    });

    it("applies outline variant classes", () => {
      render(<Toggle variant="outline">Bold</Toggle>);
      expect(screen.getByRole("button")).toHaveClass("border");
    });

    it("applies ghost variant classes", () => {
      render(<Toggle variant="ghost">Bold</Toggle>);
      const button = screen.getByRole("button");
      expect(button).not.toHaveClass("border");
      expect(button).not.toHaveClass("shadow");
    });

    // The pressed background no longer appears in the class list — it selects
    // a recipe cell in recipes/toggle.css via `data-state="on"` alongside
    // `data-variant`/`data-intent`, and the colour arrives through
    // `--button-bg`. Asserting the attributes is asserting the same decision;
    // the resolved value is covered by the visual baselines.
    it("applies pressed background for solid neutral", () => {
      render(<Toggle pressed>Bold</Toggle>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-state", "on");
      expect(button).toHaveAttribute("data-variant", "solid");
      expect(button).toHaveAttribute("data-intent", "neutral");
    });

    it("applies pressed background for outline neutral", () => {
      render(
        <Toggle variant="outline" pressed>
          Bold
        </Toggle>
      );
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-state", "on");
      expect(button).toHaveAttribute("data-variant", "outline");
      expect(button).toHaveAttribute("data-intent", "neutral");
    });

    it("applies pressed background for ghost neutral", () => {
      render(
        <Toggle variant="ghost" pressed>
          Bold
        </Toggle>
      );
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-state", "on");
      expect(button).toHaveAttribute("data-variant", "ghost");
      expect(button).toHaveAttribute("data-intent", "neutral");
    });

    // Intent no longer appears in the class list — it selects a recipe cell in
    // recipes/button.css via this attribute, and the colour arrives through
    // `--button-bg`. Asserting the attribute is asserting the same decision;
    // the resolved value is covered by the visual baselines.
    it("applies danger intent", () => {
      render(<Toggle intent="danger">Bold</Toggle>);
      expect(screen.getByRole("button")).toHaveAttribute("data-intent", "danger");
    });

    it("applies pressed background for solid danger", () => {
      render(
        <Toggle intent="danger" pressed>
          Bold
        </Toggle>
      );
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-state", "on");
      expect(button).toHaveAttribute("data-variant", "solid");
      expect(button).toHaveAttribute("data-intent", "danger");
    });

    it("applies icon size", () => {
      render(<Toggle size="icon">B</Toggle>);
      expect(screen.getByRole("button")).toHaveClass("w-9");
    });

    it("does not apply pressed background when unpressed", () => {
      render(<Toggle>Bold</Toggle>);
      expect(screen.getByRole("button")).toHaveAttribute("data-state", "off");
    });

    it("merges custom className", () => {
      render(<Toggle className="custom-class">Bold</Toggle>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
      expect(button).toHaveClass("rounded-md");
    });
  });
});
