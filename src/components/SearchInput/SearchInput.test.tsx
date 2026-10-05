/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { SearchInput, type SearchInputProps, type SearchInputSuggestion } from "./SearchInput";

const ControlledSearchInput = (props: Omit<SearchInputProps, "value" | "onValueChange">) => {
  const [value, setValue] = React.useState("");
  return <SearchInput {...props} value={value} onValueChange={setValue} />;
};

const FRUITS: SearchInputSuggestion[] = [{ value: "Apple" }, { value: "Apricot" }, { value: "Banana", label: "Banana 🍌" }];

/** Filters FRUITS by prefix, the way a caller would — SearchInput never filters. */
const SuggestingSearchInput = ({
  initial = "",
  onValueChange,
  ...props
}: Omit<SearchInputProps, "value" | "onValueChange" | "suggestions"> & { initial?: string; onValueChange?: (v: string) => void }) => {
  const [value, setValue] = React.useState(initial);
  const suggestions = FRUITS.filter((f) => f.value.toLowerCase().startsWith(value.toLowerCase()));
  return (
    <SearchInput
      aria-label="Fruit"
      {...props}
      value={value}
      onValueChange={(v) => {
        setValue(v);
        onValueChange?.(v);
      }}
      suggestions={suggestions}
    />
  );
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

  describe("submit", () => {
    it("calls onSubmit with the value on Enter", async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      render(<ControlledSearchInput onSubmit={handleSubmit} />);

      await user.type(screen.getByRole("textbox"), "invoice{Enter}");
      expect(handleSubmit).toHaveBeenCalledWith("invoice");
    });
  });

  describe("suggestions", () => {
    it("stays a plain textbox without suggestions", () => {
      render(<SearchInput value="" onValueChange={() => {}} />);
      expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    });

    it("becomes a combobox when suggestions is passed, even empty", () => {
      render(<SearchInput aria-label="Fruit" value="" onValueChange={() => {}} suggestions={[]} />);
      const input = screen.getByRole("combobox", { name: "Fruit" });
      expect(input).toHaveAttribute("aria-autocomplete", "list");
      expect(input).toHaveAttribute("aria-expanded", "false");
      expect(input).toHaveAttribute("autocomplete", "off");
    });

    it("opens on focus and renders the rows as given, using label when present", async () => {
      const user = userEvent.setup();
      render(<SuggestingSearchInput />);

      await user.click(screen.getByRole("combobox"));
      expect(screen.getByRole("combobox")).toHaveAttribute("aria-expanded", "true");
      expect(screen.getByRole("listbox", { name: "Suggestions" })).toBeInTheDocument();
      expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Apple", "Apricot", "Banana 🍌"]);
    });

    it("does not filter rows itself", async () => {
      const user = userEvent.setup();
      render(<SearchInput aria-label="Fruit" value="zzz" onValueChange={() => {}} suggestions={FRUITS} />);

      await user.click(screen.getByRole("combobox"));
      expect(screen.getAllByRole("option")).toHaveLength(3);
    });

    it("highlights nothing until the user arrows in, so Enter submits free text", async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      const handleSelect = vi.fn();
      render(<SuggestingSearchInput onSubmit={handleSubmit} onSuggestionSelect={handleSelect} />);

      await user.type(screen.getByRole("combobox"), "ap");
      expect(screen.getByRole("combobox")).not.toHaveAttribute("aria-activedescendant");

      await user.keyboard("{Enter}");
      expect(handleSubmit).toHaveBeenCalledWith("ap");
      expect(handleSelect).not.toHaveBeenCalled();
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("picks the highlighted row with Enter, filling the field without submitting", async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      const handleSelect = vi.fn();
      render(<SuggestingSearchInput onSubmit={handleSubmit} onSuggestionSelect={handleSelect} />);

      const input = screen.getByRole("combobox");
      await user.type(input, "ap");
      await user.keyboard("{ArrowDown}{ArrowDown}");
      const active = screen.getAllByRole("option")[1]!;
      expect(input).toHaveAttribute("aria-activedescendant", active.id);
      expect(active).toHaveAttribute("aria-selected", "true");

      await user.keyboard("{Enter}");
      expect(input).toHaveValue("Apricot");
      expect(handleSelect).toHaveBeenCalledWith({ value: "Apricot" });
      expect(handleSubmit).not.toHaveBeenCalled();
      expect(input).toHaveAttribute("aria-expanded", "false");
    });

    it("ArrowUp from the first row returns to the typed text", async () => {
      const user = userEvent.setup();
      render(<SuggestingSearchInput />);

      const input = screen.getByRole("combobox");
      await user.type(input, "ap");
      await user.keyboard("{ArrowDown}{ArrowUp}");
      expect(input).not.toHaveAttribute("aria-activedescendant");
    });

    it("picks a row on click and keeps focus in the field", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<SuggestingSearchInput onValueChange={handleChange} />);

      await user.click(screen.getByRole("combobox"));
      await user.click(screen.getByRole("option", { name: "Banana 🍌" }));
      expect(handleChange).toHaveBeenLastCalledWith("Banana");
      expect(screen.getByRole("combobox")).toHaveFocus();
    });

    it("closes on Escape and reopens on ArrowDown", async () => {
      const user = userEvent.setup();
      render(<SuggestingSearchInput />);

      await user.click(screen.getByRole("combobox"));
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

      await user.keyboard("{ArrowDown}");
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("closes on blur", async () => {
      const user = userEvent.setup();
      render(
        <>
          <SuggestingSearchInput />
          <button type="button">elsewhere</button>
        </>
      );

      await user.click(screen.getByRole("combobox"));
      await user.click(screen.getByRole("button", { name: "elsewhere" }));
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("clears the highlight when the rows change", async () => {
      const user = userEvent.setup();
      render(<SuggestingSearchInput />);

      const input = screen.getByRole("combobox");
      await user.type(input, "a");
      await user.keyboard("{ArrowDown}");
      expect(input).toHaveAttribute("aria-activedescendant");

      await user.type(input, "pr");
      expect(input).not.toHaveAttribute("aria-activedescendant");
    });

    it("keeps the highlight when re-rendered with an equal fresh array", async () => {
      const user = userEvent.setup();
      const { rerender } = render(<SearchInput aria-label="Fruit" value="" onValueChange={() => {}} suggestions={[...FRUITS]} />);

      await user.click(screen.getByRole("combobox"));
      await user.keyboard("{ArrowDown}");
      rerender(<SearchInput aria-label="Fruit" value="" onValueChange={() => {}} suggestions={[...FRUITS]} />);
      expect(screen.getByRole("combobox")).toHaveAttribute("aria-activedescendant");
    });

    it("shows the empty message only when there is text and no rows", async () => {
      const user = userEvent.setup();
      const { rerender } = render(<SearchInput aria-label="Fruit" value="" onValueChange={() => {}} suggestions={[]} emptyMessage="Nothing found" />);

      await user.click(screen.getByRole("combobox"));
      expect(screen.queryByText("Nothing found")).not.toBeInTheDocument();

      rerender(<SearchInput aria-label="Fruit" value="zzz" onValueChange={() => {}} suggestions={[]} emptyMessage="Nothing found" />);
      expect(screen.getByRole("status")).toHaveTextContent("Nothing found");
    });

    it("stays closed with no rows and no empty message", async () => {
      const user = userEvent.setup();
      render(<SearchInput aria-label="Fruit" value="zzz" onValueChange={() => {}} suggestions={[]} />);

      await user.click(screen.getByRole("combobox"));
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("shows the loading message with no rows, and keeps existing rows while loading", async () => {
      const user = userEvent.setup();
      const { rerender } = render(<SearchInput aria-label="Fruit" value="a" onValueChange={() => {}} suggestions={[]} loading />);

      await user.click(screen.getByRole("combobox"));
      expect(screen.getByRole("status")).toHaveTextContent("Loading…");

      rerender(<SearchInput aria-label="Fruit" value="a" onValueChange={() => {}} suggestions={FRUITS} loading />);
      expect(screen.getAllByRole("option")).toHaveLength(3);
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(screen.getByRole("listbox")).toHaveAttribute("aria-busy", "true");
    });

    it("never opens when disabled", () => {
      render(<SearchInput aria-label="Fruit" value="" onValueChange={() => {}} suggestions={FRUITS} disabled />);
      screen.getByRole("combobox").focus();
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("still calls the caller's onKeyDown, onFocus and onBlur", async () => {
      const user = userEvent.setup();
      const onKeyDown = vi.fn();
      const onFocus = vi.fn();
      const onBlur = vi.fn();
      render(<SuggestingSearchInput onKeyDown={onKeyDown} onFocus={onFocus} onBlur={onBlur} />);

      await user.click(screen.getByRole("combobox"));
      await user.keyboard("{ArrowDown}");
      await user.tab();
      expect(onFocus).toHaveBeenCalledTimes(1);
      expect(onKeyDown).toHaveBeenCalled();
      expect(onBlur).toHaveBeenCalledTimes(1);
    });
  });
});
