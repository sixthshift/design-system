/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  describe("rendering", () => {
    it("renders as a button with checkbox role", () => {
      render(<Checkbox />);
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    it("forwards ref to the button element", () => {
      const ref = vi.fn();
      render(<Checkbox ref={ref} />);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
    });

    it("spreads additional props", () => {
      render(<Checkbox data-testid="custom-checkbox" aria-label="Accept" />);
      expect(screen.getByTestId("custom-checkbox")).toHaveAttribute("aria-label", "Accept");
    });
  });

  describe("checked state", () => {
    it("is unchecked by default", () => {
      render(<Checkbox />);
      expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "false");
    });

    it("can be checked", () => {
      render(<Checkbox checked={true} />);
      expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "true");
    });

    it("can be unchecked", () => {
      render(<Checkbox checked={false} />);
      expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "false");
    });

    it("has data-state='checked' when checked", () => {
      render(<Checkbox checked={true} />);
      expect(screen.getByRole("checkbox")).toHaveAttribute("data-state", "checked");
    });

    it("has data-state='unchecked' when unchecked", () => {
      render(<Checkbox checked={false} />);
      expect(screen.getByRole("checkbox")).toHaveAttribute("data-state", "unchecked");
    });
  });

  describe("indeterminate state", () => {
    it("supports indeterminate state", () => {
      render(<Checkbox checked="indeterminate" />);
      expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "mixed");
    });

    it("has data-state='indeterminate' when indeterminate", () => {
      render(<Checkbox checked="indeterminate" />);
      expect(screen.getByRole("checkbox")).toHaveAttribute("data-state", "indeterminate");
    });
  });

  describe("disabled state", () => {
    it("is not disabled by default", () => {
      render(<Checkbox />);
      expect(screen.getByRole("checkbox")).not.toBeDisabled();
    });

    it("can be disabled", () => {
      render(<Checkbox disabled />);
      expect(screen.getByRole("checkbox")).toBeDisabled();
    });
  });

  describe("interactions", () => {
    it("calls onCheckedChange when clicked", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Checkbox onCheckedChange={handleChange} />);

      await user.click(screen.getByRole("checkbox"));
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it("toggles from checked to unchecked", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Checkbox checked={true} onCheckedChange={handleChange} />);

      await user.click(screen.getByRole("checkbox"));
      expect(handleChange).toHaveBeenCalledWith(false);
    });

    it("does not call onCheckedChange when disabled", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Checkbox disabled onCheckedChange={handleChange} />);

      await user.click(screen.getByRole("checkbox"));
      expect(handleChange).not.toHaveBeenCalled();
    });

    it("can be focused", async () => {
      const user = userEvent.setup();
      render(<Checkbox />);

      await user.tab();
      expect(screen.getByRole("checkbox")).toHaveFocus();
    });
  });

  describe("form integration", () => {
    it("renders hidden input when name is provided", () => {
      render(<Checkbox name="terms" />);
      const hiddenInput = document.querySelector('input[type="checkbox"]');
      expect(hiddenInput).toBeInTheDocument();
      expect(hiddenInput).toHaveAttribute("name", "terms");
    });

    it("does not render hidden input when name is not provided", () => {
      render(<Checkbox />);
      const hiddenInput = document.querySelector('input[type="checkbox"]');
      expect(hiddenInput).not.toBeInTheDocument();
    });

    it("hidden input has default value 'on'", () => {
      render(<Checkbox name="terms" />);
      const hiddenInput = document.querySelector('input[type="checkbox"]');
      expect(hiddenInput).toHaveAttribute("value", "on");
    });

    it("hidden input uses custom value", () => {
      render(<Checkbox name="terms" value="accepted" />);
      const hiddenInput = document.querySelector('input[type="checkbox"]');
      expect(hiddenInput).toHaveAttribute("value", "accepted");
    });

    it("hidden input reflects checked state", () => {
      render(<Checkbox name="terms" checked={true} />);
      const hiddenInput = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(hiddenInput.checked).toBe(true);
    });

    it("hidden input is disabled when checkbox is disabled", () => {
      render(<Checkbox name="terms" disabled />);
      const hiddenInput = document.querySelector('input[type="checkbox"]');
      expect(hiddenInput).toBeDisabled();
    });
  });

  describe("styling", () => {
    it("applies default classes", () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("h-4");
      expect(checkbox).toHaveClass("w-4");
      expect(checkbox).toHaveClass("rounded-xs");
      expect(checkbox).toHaveClass("border");
    });

    it("applies checked styles when checked", () => {
      render(<Checkbox checked={true} />);
      const checkbox = screen.getByRole("checkbox");
      // Colour now comes from the --checkbox-bg component token (see
      // src/theming/recipes/checkbox.css), keyed off data-state rather than a
      // literal bg-bg-brand class.
      expect(checkbox).toHaveAttribute("data-state", "checked");
      expect(checkbox).toHaveClass("checkbox");
    });

    it("merges custom className", () => {
      render(<Checkbox className="custom-class" />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("custom-class");
      expect(checkbox).toHaveClass("h-4");
    });
  });
});
