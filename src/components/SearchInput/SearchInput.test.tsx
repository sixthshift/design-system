/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { SearchInput, type SearchInputProps } from "./SearchInput";

const ControlledSearchInput = (props: Omit<SearchInputProps, "value" | "onValueChange">) => {
  const [value, setValue] = React.useState("");
  return <SearchInput {...props} value={value} onValueChange={setValue} />;
};

describe("SearchInput", () => {
  describe("rendering", () => {
    it("renders as an input element", () => {
      render(<SearchInput value="" onValueChange={() => {}} />);
      expect(screen.getByRole("textbox")).toBeInstanceOf(HTMLInputElement);
    });

    it("renders with type text", () => {
      render(<SearchInput value="" onValueChange={() => {}} />);
      expect(screen.getByRole("textbox")).toHaveAttribute("type", "text");
    });

    it("renders a search icon", () => {
      const { container } = render(<SearchInput value="" onValueChange={() => {}} />);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("forwards ref to the input element", () => {
      const ref = vi.fn();
      render(<SearchInput ref={ref} value="" onValueChange={() => {}} />);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
    });

    it("spreads additional props", () => {
      render(<SearchInput value="" onValueChange={() => {}} data-testid="custom-search" aria-label="Search" />);
      expect(screen.getByTestId("custom-search")).toHaveAttribute("aria-label", "Search");
    });
  });

  describe("clear button", () => {
    it("does not render a clear button when value is empty", () => {
      render(<SearchInput value="" onValueChange={() => {}} />);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("renders a clear button when value is non-empty", () => {
      render(<SearchInput value="hello" onValueChange={() => {}} />);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("calls onValueChange with empty string when clear button is clicked and no onClear provided", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<SearchInput value="hello" onValueChange={handleChange} />);

      await user.click(screen.getByRole("button"));
      expect(handleChange).toHaveBeenCalledWith("");
    });

    it("calls onClear instead of onValueChange when onClear is provided", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const handleClear = vi.fn();
      render(<SearchInput value="hello" onValueChange={handleChange} onClear={handleClear} />);

      await user.click(screen.getByRole("button"));
      expect(handleClear).toHaveBeenCalledTimes(1);
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe("controlled value", () => {
    it("reflects the value prop", () => {
      render(<SearchInput value="hello world" onValueChange={() => {}} />);
      expect(screen.getByRole("textbox")).toHaveValue("hello world");
    });

    it("updates displayed value when the value prop changes", () => {
      const { rerender } = render(<SearchInput value="foo" onValueChange={() => {}} />);
      expect(screen.getByRole("textbox")).toHaveValue("foo");

      rerender(<SearchInput value="bar" onValueChange={() => {}} />);
      expect(screen.getByRole("textbox")).toHaveValue("bar");
    });
  });

  describe("interactions", () => {
    it("calls onValueChange with the typed value on each keystroke", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<SearchInput value="" onValueChange={handleChange} />);

      await user.type(screen.getByRole("textbox"), "a");
      expect(handleChange).toHaveBeenCalledWith("a");
    });

    it("accumulates typed characters when the value prop is kept in sync", async () => {
      const user = userEvent.setup();
      render(<ControlledSearchInput />);

      await user.type(screen.getByRole("textbox"), "hello");
      expect(screen.getByRole("textbox")).toHaveValue("hello");
    });

    it("does not allow typing when disabled", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<SearchInput value="" onValueChange={handleChange} disabled />);

      await user.type(screen.getByRole("textbox"), "hello");
      expect(handleChange).not.toHaveBeenCalled();
    });

    it("can be focused", async () => {
      const user = userEvent.setup();
      render(<SearchInput value="" onValueChange={() => {}} />);

      await user.tab();
      expect(screen.getByRole("textbox")).toHaveFocus();
    });
  });

  describe("props", () => {
    it("renders a placeholder", () => {
      render(<SearchInput value="" onValueChange={() => {}} placeholder="Search..." />);
      expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
    });

    it("can be disabled", () => {
      render(<SearchInput value="" onValueChange={() => {}} disabled />);
      expect(screen.getByRole("textbox")).toBeDisabled();
    });

    it("is not disabled by default", () => {
      render(<SearchInput value="" onValueChange={() => {}} />);
      expect(screen.getByRole("textbox")).not.toBeDisabled();
    });
  });

  describe("className merging", () => {
    it("merges custom className onto the wrapper", () => {
      const { container } = render(<SearchInput value="" onValueChange={() => {}} className="custom-class" />);
      expect(container.firstChild).toHaveClass("custom-class");
    });
  });
});
