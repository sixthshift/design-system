/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { SearchInput, type SearchInputProps } from "./SearchInput";

const ControlledSearchInput = (props: Omit<SearchInputProps, "value" | "onChange">) => {
  const [value, setValue] = React.useState("");
  return <SearchInput {...props} value={value} onChange={setValue} />;
};

describe("SearchInput", () => {
  describe("rendering", () => {
    it("renders as an input element", () => {
      render(<SearchInput value="" onChange={() => {}} />);
      expect(screen.getByRole("textbox")).toBeInstanceOf(HTMLInputElement);
    });

    it("renders with type text", () => {
      render(<SearchInput value="" onChange={() => {}} />);
      expect(screen.getByRole("textbox")).toHaveAttribute("type", "text");
    });

    it("renders a search icon", () => {
      const { container } = render(<SearchInput value="" onChange={() => {}} />);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("forwards ref to the input element", () => {
      const ref = vi.fn();
      render(<SearchInput ref={ref} value="" onChange={() => {}} />);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
    });

    it("spreads additional props", () => {
      render(<SearchInput value="" onChange={() => {}} data-testid="custom-search" aria-label="Search" />);
      expect(screen.getByTestId("custom-search")).toHaveAttribute("aria-label", "Search");
    });
  });

  describe("clear button", () => {
    it("does not render a clear button when value is empty", () => {
      render(<SearchInput value="" onChange={() => {}} />);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("renders a clear button when value is non-empty", () => {
      render(<SearchInput value="hello" onChange={() => {}} />);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("calls onChange with empty string when clear button is clicked and no onClear provided", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<SearchInput value="hello" onChange={handleChange} />);

      await user.click(screen.getByRole("button"));
      expect(handleChange).toHaveBeenCalledWith("");
    });

    it("calls onClear instead of onChange when onClear is provided", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const handleClear = vi.fn();
      render(<SearchInput value="hello" onChange={handleChange} onClear={handleClear} />);

      await user.click(screen.getByRole("button"));
      expect(handleClear).toHaveBeenCalledTimes(1);
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe("controlled value", () => {
    it("reflects the value prop", () => {
      render(<SearchInput value="hello world" onChange={() => {}} />);
      expect(screen.getByRole("textbox")).toHaveValue("hello world");
    });

    it("updates displayed value when the value prop changes", () => {
      const { rerender } = render(<SearchInput value="foo" onChange={() => {}} />);
      expect(screen.getByRole("textbox")).toHaveValue("foo");

      rerender(<SearchInput value="bar" onChange={() => {}} />);
      expect(screen.getByRole("textbox")).toHaveValue("bar");
    });
  });

  describe("interactions", () => {
    it("calls onChange with the typed value on each keystroke", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<SearchInput value="" onChange={handleChange} />);

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
      render(<SearchInput value="" onChange={handleChange} disabled />);

      await user.type(screen.getByRole("textbox"), "hello");
      expect(handleChange).not.toHaveBeenCalled();
    });

    it("can be focused", async () => {
      const user = userEvent.setup();
      render(<SearchInput value="" onChange={() => {}} />);

      await user.tab();
      expect(screen.getByRole("textbox")).toHaveFocus();
    });
  });

  describe("props", () => {
    it("renders a placeholder", () => {
      render(<SearchInput value="" onChange={() => {}} placeholder="Search..." />);
      expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
    });

    it("can be disabled", () => {
      render(<SearchInput value="" onChange={() => {}} disabled />);
      expect(screen.getByRole("textbox")).toBeDisabled();
    });

    it("is not disabled by default", () => {
      render(<SearchInput value="" onChange={() => {}} />);
      expect(screen.getByRole("textbox")).not.toBeDisabled();
    });
  });

  describe("className merging", () => {
    it("merges custom className onto the wrapper", () => {
      const { container } = render(<SearchInput value="" onChange={() => {}} className="custom-class" />);
      expect(container.firstChild).toHaveClass("custom-class");
    });
  });
});
