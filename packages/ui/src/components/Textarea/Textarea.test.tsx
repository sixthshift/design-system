/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Textarea } from "./Textarea";

describe("Textarea", () => {
  describe("rendering", () => {
    it("renders as a textarea element", () => {
      render(<Textarea />);
      expect(screen.getByRole("textbox")).toBeInstanceOf(HTMLTextAreaElement);
    });

    it("forwards ref to the textarea element", () => {
      const ref = vi.fn();
      render(<Textarea ref={ref} />);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLTextAreaElement));
    });

    it("spreads additional props", () => {
      render(<Textarea data-testid="custom-textarea" aria-label="Message" />);
      expect(screen.getByTestId("custom-textarea")).toHaveAttribute("aria-label", "Message");
    });
  });

  describe("states", () => {
    it("is not disabled by default", () => {
      render(<Textarea />);
      expect(screen.getByRole("textbox")).not.toBeDisabled();
    });

    it("can be disabled", () => {
      render(<Textarea disabled />);
      expect(screen.getByRole("textbox")).toBeDisabled();
    });

    it("can be readonly", () => {
      render(<Textarea readOnly />);
      expect(screen.getByRole("textbox")).toHaveAttribute("readonly");
    });

    it("can have a placeholder", () => {
      render(<Textarea placeholder="Enter message..." />);
      expect(screen.getByPlaceholderText("Enter message...")).toBeInTheDocument();
    });

    it("can have a default value", () => {
      render(<Textarea defaultValue="default text" />);
      expect(screen.getByRole("textbox")).toHaveValue("default text");
    });

    it("can be controlled", () => {
      const handleChange = vi.fn();
      render(<Textarea value="controlled" onChange={handleChange} />);
      expect(screen.getByRole("textbox")).toHaveValue("controlled");
    });
  });

  describe("interactions", () => {
    it("calls onChange when typing", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Textarea onChange={handleChange} />);

      await user.type(screen.getByRole("textbox"), "hello");
      expect(handleChange).toHaveBeenCalled();
    });

    it("can be focused", async () => {
      const user = userEvent.setup();
      render(<Textarea />);

      await user.tab();
      expect(screen.getByRole("textbox")).toHaveFocus();
    });

    it("does not allow typing when disabled", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Textarea disabled onChange={handleChange} />);

      await user.type(screen.getByRole("textbox"), "hello");
      expect(handleChange).not.toHaveBeenCalled();
    });

    it("supports multiline input", async () => {
      const user = userEvent.setup();
      render(<Textarea />);

      await user.type(screen.getByRole("textbox"), "line1{enter}line2");
      expect(screen.getByRole("textbox")).toHaveValue("line1\nline2");
    });
  });

  describe("styling", () => {
    it("applies default classes", () => {
      render(<Textarea />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("flex");
      expect(textarea).toHaveClass("min-h-[60px]");
      expect(textarea).toHaveClass("w-full");
      expect(textarea).toHaveClass("rounded-md");
      expect(textarea).toHaveClass("border");
      expect(textarea).toHaveClass("text-sm");
    });

    it("merges custom className", () => {
      render(<Textarea className="custom-class" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("custom-class");
      expect(textarea).toHaveClass("rounded-md");
    });
  });

  describe("form attributes", () => {
    it("accepts name attribute", () => {
      render(<Textarea name="message" />);
      expect(screen.getByRole("textbox")).toHaveAttribute("name", "message");
    });

    it("accepts required attribute", () => {
      render(<Textarea required />);
      expect(screen.getByRole("textbox")).toBeRequired();
    });

    it("accepts rows attribute", () => {
      render(<Textarea rows={5} />);
      expect(screen.getByRole("textbox")).toHaveAttribute("rows", "5");
    });

    it("accepts cols attribute", () => {
      render(<Textarea cols={30} />);
      expect(screen.getByRole("textbox")).toHaveAttribute("cols", "30");
    });

    it("accepts minLength and maxLength", () => {
      render(<Textarea minLength={10} maxLength={500} />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("minLength", "10");
      expect(textarea).toHaveAttribute("maxLength", "500");
    });
  });
});
