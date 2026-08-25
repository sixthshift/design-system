/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Switch } from "./Switch";

describe("Switch", () => {
  describe("rendering", () => {
    it("renders as a button with switch role", () => {
      render(<Switch />);
      expect(screen.getByRole("switch")).toBeInTheDocument();
    });

    it("forwards ref to the button element", () => {
      const ref = vi.fn();
      render(<Switch ref={ref} />);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
    });

    it("spreads additional props", () => {
      render(<Switch data-testid="custom-switch" aria-label="Toggle" />);
      expect(screen.getByTestId("custom-switch")).toHaveAttribute("aria-label", "Toggle");
    });
  });

  describe("checked state", () => {
    it("is unchecked by default", () => {
      render(<Switch />);
      expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
    });

    it("can be checked", () => {
      render(<Switch checked={true} />);
      expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
    });

    it("can be unchecked", () => {
      render(<Switch checked={false} />);
      expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
    });

    it("has data-state='checked' when checked", () => {
      render(<Switch checked={true} />);
      expect(screen.getByRole("switch")).toHaveAttribute("data-state", "checked");
    });

    it("has data-state='unchecked' when unchecked", () => {
      render(<Switch checked={false} />);
      expect(screen.getByRole("switch")).toHaveAttribute("data-state", "unchecked");
    });
  });

  describe("disabled state", () => {
    it("is not disabled by default", () => {
      render(<Switch />);
      expect(screen.getByRole("switch")).not.toBeDisabled();
    });

    it("can be disabled", () => {
      render(<Switch disabled />);
      expect(screen.getByRole("switch")).toBeDisabled();
    });
  });

  describe("interactions", () => {
    it("calls onCheckedChange when clicked", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Switch onCheckedChange={handleChange} />);

      await user.click(screen.getByRole("switch"));
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it("toggles from checked to unchecked", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Switch checked={true} onCheckedChange={handleChange} />);

      await user.click(screen.getByRole("switch"));
      expect(handleChange).toHaveBeenCalledWith(false);
    });

    it("does not call onCheckedChange when disabled", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Switch disabled onCheckedChange={handleChange} />);

      await user.click(screen.getByRole("switch"));
      expect(handleChange).not.toHaveBeenCalled();
    });

    it("can be focused", async () => {
      const user = userEvent.setup();
      render(<Switch />);

      await user.tab();
      expect(screen.getByRole("switch")).toHaveFocus();
    });
  });

  describe("pending state", () => {
    it("does not call onCheckedChange when pending", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Switch pending onCheckedChange={handleChange} />);

      await user.click(screen.getByRole("switch"));
      expect(handleChange).not.toHaveBeenCalled();
    });

    it("renders a spinner inside the thumb when pending", () => {
      render(<Switch pending />);
      const spinner = screen.getByRole("switch").querySelector("svg");
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass("animate-spin");
    });

    it("does not render a spinner when not pending", () => {
      render(<Switch />);
      const spinner = screen.getByRole("switch").querySelector("svg");
      expect(spinner).not.toBeInTheDocument();
    });

    it("sets aria-busy when pending", () => {
      render(<Switch pending />);
      expect(screen.getByRole("switch")).toHaveAttribute("aria-busy", "true");
    });

    it("does not set aria-busy when not pending", () => {
      render(<Switch />);
      expect(screen.getByRole("switch")).not.toHaveAttribute("aria-busy");
    });

    it("is not visually disabled when pending", () => {
      render(<Switch pending />);
      expect(screen.getByRole("switch")).not.toBeDisabled();
      expect(screen.getByRole("switch")).not.toHaveClass("opacity-50");
    });
  });

  describe("form integration", () => {
    it("renders hidden input when name is provided", () => {
      render(<Switch name="notifications" />);
      const hiddenInput = document.querySelector('input[type="checkbox"]');
      expect(hiddenInput).toBeInTheDocument();
      expect(hiddenInput).toHaveAttribute("name", "notifications");
    });

    it("does not render hidden input when name is not provided", () => {
      render(<Switch />);
      const hiddenInput = document.querySelector('input[type="checkbox"]');
      expect(hiddenInput).not.toBeInTheDocument();
    });

    it("hidden input has default value 'on'", () => {
      render(<Switch name="notifications" />);
      const hiddenInput = document.querySelector('input[type="checkbox"]');
      expect(hiddenInput).toHaveAttribute("value", "on");
    });

    it("hidden input uses custom value", () => {
      render(<Switch name="notifications" value="enabled" />);
      const hiddenInput = document.querySelector('input[type="checkbox"]');
      expect(hiddenInput).toHaveAttribute("value", "enabled");
    });

    it("hidden input reflects checked state", () => {
      render(<Switch name="notifications" checked={true} />);
      const hiddenInput = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(hiddenInput.checked).toBe(true);
    });

    it("hidden input is disabled when switch is disabled", () => {
      render(<Switch name="notifications" disabled />);
      const hiddenInput = document.querySelector('input[type="checkbox"]');
      expect(hiddenInput).toBeDisabled();
    });
  });

  describe("styling", () => {
    it("applies default classes", () => {
      render(<Switch />);
      const switchEl = screen.getByRole("switch");
      expect(switchEl).toHaveClass("h-5");
      expect(switchEl).toHaveClass("w-9");
      expect(switchEl).toHaveClass("rounded-full");
    });

    it("applies unchecked background", () => {
      render(<Switch checked={false} />);
      expect(screen.getByRole("switch")).toHaveClass("bg-bg-subtle");
    });

    it("applies checked background", () => {
      render(<Switch checked={true} />);
      expect(screen.getByRole("switch")).toHaveClass("bg-bg-brand");
    });

    it("merges custom className", () => {
      render(<Switch className="custom-class" />);
      const switchEl = screen.getByRole("switch");
      expect(switchEl).toHaveClass("custom-class");
      expect(switchEl).toHaveClass("h-5");
    });
  });

  describe("thumb element", () => {
    it("contains a thumb element", () => {
      render(<Switch />);
      const thumb = screen.getByRole("switch").querySelector("span");
      expect(thumb).toBeInTheDocument();
    });

    it("thumb has correct size", () => {
      render(<Switch />);
      const thumb = screen.getByRole("switch").querySelector("span");
      expect(thumb).toHaveClass("h-4");
      expect(thumb).toHaveClass("w-4");
    });

    it("thumb translates when checked", () => {
      render(<Switch checked={true} />);
      const thumb = screen.getByRole("switch").querySelector("span");
      expect(thumb).toHaveClass("translate-x-4");
    });

    it("thumb is at start when unchecked", () => {
      render(<Switch checked={false} />);
      const thumb = screen.getByRole("switch").querySelector("span");
      expect(thumb).toHaveClass("translate-x-0");
    });
  });
});
