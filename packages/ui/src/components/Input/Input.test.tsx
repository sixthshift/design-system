/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Input } from "./Input";

describe("Input", () => {
  describe("rendering", () => {
    it("renders as an input element", () => {
      render(<Input />);
      expect(screen.getByRole("textbox")).toBeInstanceOf(HTMLInputElement);
    });

    it("forwards ref to the input element", () => {
      const ref = vi.fn();
      render(<Input ref={ref} />);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
    });

    it("spreads additional props", () => {
      render(<Input data-testid="custom-input" aria-label="Test input" />);
      expect(screen.getByTestId("custom-input")).toHaveAttribute("aria-label", "Test input");
    });
  });

  describe("types", () => {
    it("defaults to text type", () => {
      render(<Input />);
      const input = screen.getByRole("textbox") as HTMLInputElement;
      // Browser defaults to "text" even when attribute is not explicitly set
      expect(input.type).toBe("text");
    });

    it("accepts different input types", () => {
      const { rerender } = render(<Input type="email" />);
      expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");

      rerender(<Input type="password" />);
      expect(document.querySelector('input[type="password"]')).toBeInTheDocument();

      rerender(<Input type="number" />);
      expect(screen.getByRole("spinbutton")).toHaveAttribute("type", "number");
    });
  });

  describe("states", () => {
    it("is not disabled by default", () => {
      render(<Input />);
      expect(screen.getByRole("textbox")).not.toBeDisabled();
    });

    it("can be disabled", () => {
      render(<Input disabled />);
      expect(screen.getByRole("textbox")).toBeDisabled();
    });

    it("can be readonly", () => {
      render(<Input readOnly />);
      expect(screen.getByRole("textbox")).toHaveAttribute("readonly");
    });

    it("can have a placeholder", () => {
      render(<Input placeholder="Enter text..." />);
      expect(screen.getByPlaceholderText("Enter text...")).toBeInTheDocument();
    });

    it("can have a default value", () => {
      render(<Input defaultValue="default text" />);
      expect(screen.getByRole("textbox")).toHaveValue("default text");
    });

    it("can be controlled", () => {
      const handleChange = vi.fn();
      render(<Input value="controlled" onChange={handleChange} />);
      expect(screen.getByRole("textbox")).toHaveValue("controlled");
    });
  });

  describe("interactions", () => {
    it("calls onChange when typing", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);

      await user.type(screen.getByRole("textbox"), "hello");
      expect(handleChange).toHaveBeenCalled();
    });

    it("can be focused", async () => {
      const user = userEvent.setup();
      render(<Input />);

      await user.tab();
      expect(screen.getByRole("textbox")).toHaveFocus();
    });

    it("does not allow typing when disabled", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Input disabled onChange={handleChange} />);

      await user.type(screen.getByRole("textbox"), "hello");
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe("styling", () => {
    it("applies default classes", () => {
      render(<Input />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("flex");
      expect(input).toHaveClass("h-9");
      expect(input).toHaveClass("w-full");
      expect(input).toHaveClass("rounded-md");
      expect(input).toHaveClass("border");
      expect(input).toHaveClass("text-sm");
    });

    it("merges custom className", () => {
      render(<Input className="custom-class" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("custom-class");
      expect(input).toHaveClass("rounded-md");
    });
  });

  describe("form attributes", () => {
    it("accepts name attribute", () => {
      render(<Input name="email" />);
      expect(screen.getByRole("textbox")).toHaveAttribute("name", "email");
    });

    it("accepts required attribute", () => {
      render(<Input required />);
      expect(screen.getByRole("textbox")).toBeRequired();
    });

    it("accepts minLength and maxLength", () => {
      render(<Input minLength={3} maxLength={10} />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("minLength", "3");
      expect(input).toHaveAttribute("maxLength", "10");
    });
  });
});
