/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { RadioButton } from "./RadioButton";

describe("RadioButton", () => {
  describe("rendering", () => {
    it("renders as a button with radio role", () => {
      render(<RadioButton />);
      expect(screen.getByRole("radio")).toBeInTheDocument();
    });

    it("forwards ref to the button element", () => {
      const ref = vi.fn();
      render(<RadioButton ref={ref} />);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
    });

    it("spreads additional props", () => {
      render(<RadioButton data-testid="custom-radio" aria-label="Accept" />);
      expect(screen.getByTestId("custom-radio")).toHaveAttribute("aria-label", "Accept");
    });
  });

  describe("checked state", () => {
    it("is unchecked by default", () => {
      render(<RadioButton />);
      expect(screen.getByRole("radio")).toHaveAttribute("aria-checked", "false");
    });

    it("can be checked", () => {
      render(<RadioButton checked={true} />);
      expect(screen.getByRole("radio")).toHaveAttribute("aria-checked", "true");
    });

    it("can be unchecked", () => {
      render(<RadioButton checked={false} />);
      expect(screen.getByRole("radio")).toHaveAttribute("aria-checked", "false");
    });

    it("has data-state='checked' when checked", () => {
      render(<RadioButton checked={true} />);
      expect(screen.getByRole("radio")).toHaveAttribute("data-state", "checked");
    });

    it("has data-state='unchecked' when unchecked", () => {
      render(<RadioButton checked={false} />);
      expect(screen.getByRole("radio")).toHaveAttribute("data-state", "unchecked");
    });
  });

  describe("disabled state", () => {
    it("is not disabled by default", () => {
      render(<RadioButton />);
      expect(screen.getByRole("radio")).not.toBeDisabled();
    });

    it("can be disabled", () => {
      render(<RadioButton disabled />);
      expect(screen.getByRole("radio")).toBeDisabled();
    });
  });

  describe("interactions", () => {
    it("calls onCheckedChange with true when an unchecked radio is clicked", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<RadioButton onCheckedChange={handleChange} />);

      await user.click(screen.getByRole("radio"));
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it("calls onCheckedChange with false when clicking a checked radio", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<RadioButton checked={true} onCheckedChange={handleChange} />);

      await user.click(screen.getByRole("radio"));
      expect(handleChange).toHaveBeenCalledWith(false);
    });

    it("does not call onCheckedChange when disabled", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<RadioButton disabled onCheckedChange={handleChange} />);

      await user.click(screen.getByRole("radio"));
      expect(handleChange).not.toHaveBeenCalled();
    });

    it("can be focused", async () => {
      const user = userEvent.setup();
      render(<RadioButton />);

      await user.tab();
      expect(screen.getByRole("radio")).toHaveFocus();
    });

    it("toggles via the keyboard when focused and Space is pressed", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<RadioButton onCheckedChange={handleChange} />);

      await user.tab();
      await user.keyboard(" ");
      expect(handleChange).toHaveBeenCalledWith(true);
    });
  });

  describe("label", () => {
    it("renders the provided label text", () => {
      render(<RadioButton label="Accept terms" />);
      expect(screen.getByText("Accept terms")).toBeInTheDocument();
    });

    it("associates the label with the radio via htmlFor/id", () => {
      render(<RadioButton label="Accept terms" />);
      const radio = screen.getByRole("radio");
      const label = screen.getByText("Accept terms");
      expect(label).toHaveAttribute("for", radio.id);
      expect(radio.id).toBeTruthy();
    });

    it("does not render a wrapping id when no label is provided", () => {
      render(<RadioButton />);
      expect(screen.getByRole("radio")).not.toHaveAttribute("id");
    });

    it("uses an explicit id when provided alongside a label", () => {
      render(<RadioButton label="Accept terms" id="custom-id" />);
      const radio = screen.getByRole("radio");
      expect(radio).toHaveAttribute("id", "custom-id");
      expect(screen.getByText("Accept terms")).toHaveAttribute("for", "custom-id");
    });
  });

  describe("form integration", () => {
    it("renders a visually-hidden native radio input when name is provided", () => {
      render(<RadioButton name="plan" value="pro" />);
      const hiddenInput = document.querySelector('input[type="radio"]');
      expect(hiddenInput).toBeInTheDocument();
      expect(hiddenInput).toHaveAttribute("name", "plan");
      expect(hiddenInput).toHaveAttribute("value", "pro");
    });

    it("does not render a hidden input when name is not provided", () => {
      render(<RadioButton />);
      expect(document.querySelector('input[type="radio"]')).not.toBeInTheDocument();
    });

    it("hidden input defaults to value 'on'", () => {
      render(<RadioButton name="plan" />);
      expect(document.querySelector('input[type="radio"]')).toHaveAttribute("value", "on");
    });

    it("hidden input reflects checked state", () => {
      render(<RadioButton name="plan" checked={true} />);
      const hiddenInput = document.querySelector('input[type="radio"]') as HTMLInputElement;
      expect(hiddenInput.checked).toBe(true);
    });

    it("hidden input is disabled when the radio button is disabled", () => {
      render(<RadioButton name="plan" disabled />);
      expect(document.querySelector('input[type="radio"]')).toBeDisabled();
    });
  });

  describe("styling", () => {
    it("applies default classes", () => {
      render(<RadioButton />);
      const radio = screen.getByRole("radio");
      expect(radio).toHaveClass("h-4");
      expect(radio).toHaveClass("w-4");
      expect(radio).toHaveClass("rounded-full");
      expect(radio).toHaveClass("border");
    });

    it("applies checked styles when checked", () => {
      render(<RadioButton checked={true} />);
      const radio = screen.getByRole("radio");
      // Colour now comes from the --radio-button-bg component token (see
      // src/theme/recipes/radio-button.css), keyed off data-state rather
      // than a literal bg-bg-brand class.
      expect(radio).toHaveAttribute("data-state", "checked");
      expect(radio).toHaveClass("radio-button");
    });

    it("merges custom className", () => {
      render(<RadioButton className="custom-class" />);
      const radio = screen.getByRole("radio");
      expect(radio).toHaveClass("custom-class");
      expect(radio).toHaveClass("h-4");
    });
  });
});
