/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Select } from "./Select";

const options = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
] as const;

describe("Select", () => {
  describe("rendering", () => {
    it("renders a button trigger", () => {
      render(<Select value="apple" options={options} onValueChange={() => {}} />);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("displays selected option label", () => {
      render(<Select value="banana" options={options} onValueChange={() => {}} />);
      expect(screen.getByText("Banana")).toBeInTheDocument();
    });

    it("displays placeholder when no value matches", () => {
      render(<Select value={"" as "apple"} options={options} onValueChange={() => {}} placeholder="Choose fruit" />);
      expect(screen.getByText("Choose fruit")).toBeInTheDocument();
    });

    it("has aria-haspopup='listbox'", () => {
      render(<Select value="apple" options={options} onValueChange={() => {}} />);
      expect(screen.getByRole("button")).toHaveAttribute("aria-haspopup", "listbox");
    });
  });

  describe("dropdown behavior", () => {
    it("opens dropdown when clicked", async () => {
      const user = userEvent.setup();
      render(<Select value="apple" options={options} onValueChange={() => {}} />);

      await user.click(screen.getByRole("button"));
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("shows all options when open", async () => {
      const user = userEvent.setup();
      render(<Select value="apple" options={options} onValueChange={() => {}} />);

      await user.click(screen.getByRole("button"));
      expect(screen.getByRole("option", { name: "Apple" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Banana" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Cherry" })).toBeInTheDocument();
    });

    it("closes dropdown after selection", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Select value="apple" options={options} onValueChange={handleChange} />);

      await user.click(screen.getByRole("button"));
      await user.click(screen.getByRole("option", { name: "Banana" }));

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("sets aria-expanded when open", async () => {
      const user = userEvent.setup();
      render(<Select value="apple" options={options} onValueChange={() => {}} />);

      expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false");

      await user.click(screen.getByRole("button"));
      expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("selection", () => {
    it("calls onChange with selected value", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Select value="apple" options={options} onValueChange={handleChange} />);

      await user.click(screen.getByRole("button"));
      await user.click(screen.getByRole("option", { name: "Cherry" }));

      expect(handleChange).toHaveBeenCalledWith("cherry");
    });

    it("marks selected option with aria-selected", async () => {
      const user = userEvent.setup();
      render(<Select value="banana" options={options} onValueChange={() => {}} />);

      await user.click(screen.getByRole("button"));
      expect(screen.getByRole("option", { name: "Banana" })).toHaveAttribute("aria-selected", "true");
      expect(screen.getByRole("option", { name: "Apple" })).toHaveAttribute("aria-selected", "false");
    });
  });

  describe("disabled state", () => {
    it("can be disabled", () => {
      render(<Select value="apple" options={options} onValueChange={() => {}} disabled />);
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("does not open when disabled", async () => {
      const user = userEvent.setup();
      render(<Select value="apple" options={options} onValueChange={() => {}} disabled />);

      await user.click(screen.getByRole("button"));
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  describe("collapsed mode", () => {
    it("shows abbreviated trigger when collapsed", () => {
      render(<Select value="banana" options={options} onValueChange={() => {}} collapsed />);
      // Should show first letter of "Banana"
      expect(screen.getByText("B")).toBeInTheDocument();
    });

    it("does not open when collapsed", async () => {
      const user = userEvent.setup();
      render(<Select value="apple" options={options} onValueChange={() => {}} collapsed />);

      await user.click(screen.getByRole("button"));
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("shows title tooltip when collapsed", () => {
      render(<Select value="banana" options={options} onValueChange={() => {}} collapsed />);
      expect(screen.getByRole("button")).toHaveAttribute("title", "Banana");
    });
  });

  describe("keyboard behavior", () => {
    it("closes on Escape key", async () => {
      const user = userEvent.setup();
      render(<Select value="apple" options={options} onValueChange={() => {}} />);

      await user.click(screen.getByRole("button"));
      expect(screen.getByRole("listbox")).toBeInTheDocument();

      await user.keyboard("{Escape}");
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("opens on ArrowDown when closed", async () => {
      const user = userEvent.setup();
      render(<Select value="apple" options={options} onValueChange={() => {}} />);

      screen.getByRole("button").focus();
      await user.keyboard("{ArrowDown}");
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("opens on ArrowUp when closed", async () => {
      const user = userEvent.setup();
      render(<Select value="apple" options={options} onValueChange={() => {}} />);

      screen.getByRole("button").focus();
      await user.keyboard("{ArrowUp}");
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("opens on Enter when closed", async () => {
      const user = userEvent.setup();
      render(<Select value="apple" options={options} onValueChange={() => {}} />);

      screen.getByRole("button").focus();
      await user.keyboard("{Enter}");
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("opens on Space when closed", async () => {
      const user = userEvent.setup();
      render(<Select value="apple" options={options} onValueChange={() => {}} />);

      screen.getByRole("button").focus();
      await user.keyboard(" ");
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("navigates down with ArrowDown", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Select value="apple" options={options} onValueChange={handleChange} />);

      await user.click(screen.getByRole("button"));
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{Enter}");

      expect(handleChange).toHaveBeenCalledWith("banana");
    });

    it("navigates up with ArrowUp", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Select value="banana" options={options} onValueChange={handleChange} />);

      await user.click(screen.getByRole("button"));
      await user.keyboard("{ArrowUp}");
      await user.keyboard("{Enter}");

      expect(handleChange).toHaveBeenCalledWith("apple");
    });

    it("jumps to first option with Home", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Select value="cherry" options={options} onValueChange={handleChange} />);

      await user.click(screen.getByRole("button"));
      await user.keyboard("{Home}");
      await user.keyboard("{Enter}");

      expect(handleChange).toHaveBeenCalledWith("apple");
    });

    it("jumps to last option with End", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Select value="apple" options={options} onValueChange={handleChange} />);

      await user.click(screen.getByRole("button"));
      await user.keyboard("{End}");
      await user.keyboard("{Enter}");

      expect(handleChange).toHaveBeenCalledWith("cherry");
    });

    it("selects highlighted option with Enter", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Select value="apple" options={options} onValueChange={handleChange} />);

      await user.click(screen.getByRole("button"));
      await user.keyboard("{ArrowDown}{Enter}");

      expect(handleChange).toHaveBeenCalledWith("banana");
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("selects highlighted option with Space", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Select value="apple" options={options} onValueChange={handleChange} />);

      await user.click(screen.getByRole("button"));
      await user.keyboard("{ArrowDown} ");

      expect(handleChange).toHaveBeenCalledWith("banana");
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("supports type-ahead search", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Select value="apple" options={options} onValueChange={handleChange} />);

      await user.click(screen.getByRole("button"));
      await user.keyboard("c");
      await user.keyboard("{Enter}");

      expect(handleChange).toHaveBeenCalledWith("cherry");
    });

    it("does not navigate past first option", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Select value="apple" options={options} onValueChange={handleChange} />);

      await user.click(screen.getByRole("button"));
      await user.keyboard("{ArrowUp}");
      await user.keyboard("{Enter}");

      expect(handleChange).toHaveBeenCalledWith("apple");
    });

    it("does not navigate past last option", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Select value="cherry" options={options} onValueChange={handleChange} />);

      await user.click(screen.getByRole("button"));
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{Enter}");

      expect(handleChange).toHaveBeenCalledWith("cherry");
    });

    it("closes on Tab", async () => {
      const user = userEvent.setup();
      render(<Select value="apple" options={options} onValueChange={() => {}} />);

      await user.click(screen.getByRole("button"));
      expect(screen.getByRole("listbox")).toBeInTheDocument();

      await user.keyboard("{Tab}");
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("returns focus to trigger on Escape", async () => {
      const user = userEvent.setup();
      render(<Select value="apple" options={options} onValueChange={() => {}} />);

      const trigger = screen.getByRole("button");
      await user.click(trigger);
      await user.keyboard("{Escape}");

      expect(trigger).toHaveFocus();
    });

    it("returns focus to trigger after selection", async () => {
      const user = userEvent.setup();
      render(<Select value="apple" options={options} onValueChange={() => {}} />);

      const trigger = screen.getByRole("button");
      await user.click(trigger);
      await user.keyboard("{ArrowDown}{Enter}");

      expect(trigger).toHaveFocus();
    });
  });

  describe("focus management", () => {
    it("highlights selected option when opening", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Select value="banana" options={options} onValueChange={handleChange} />);

      await user.click(screen.getByRole("button"));
      // Pressing Enter should select the currently highlighted (selected) option
      await user.keyboard("{Enter}");

      expect(handleChange).toHaveBeenCalledWith("banana");
    });

    it("highlights first option when no value selected", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Select value={"" as "apple"} options={options} onValueChange={handleChange} />);

      await user.click(screen.getByRole("button"));
      await user.keyboard("{Enter}");

      expect(handleChange).toHaveBeenCalledWith("apple");
    });
  });

  describe("styling", () => {
    it("applies default classes to trigger", () => {
      render(<Select value="apple" options={options} onValueChange={() => {}} />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("rounded-md");
      expect(button).toHaveClass("border");
    });

    it("merges custom className", () => {
      render(<Select value="apple" options={options} onValueChange={() => {}} className="custom-class" />);
      // className is now on the button itself
      expect(screen.getByRole("button")).toHaveClass("custom-class");
    });
  });

  describe("searchable mode", () => {
    it("renders as button when closed", () => {
      render(<Select value="apple" options={options} onValueChange={() => {}} searchable />);
      expect(screen.getByRole("button")).toBeInTheDocument();
      expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    });

    it("transforms to input when opened", async () => {
      const user = userEvent.setup();
      render(<Select value="apple" options={options} onValueChange={() => {}} searchable />);

      await user.click(screen.getByRole("button"));
      expect(screen.getByRole("combobox")).toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("filters options based on search input", async () => {
      const user = userEvent.setup();
      render(<Select value="apple" options={options} onValueChange={() => {}} searchable />);

      await user.click(screen.getByRole("button"));
      const input = screen.getByRole("combobox");

      await user.type(input, "ba");

      // Should show only Banana
      expect(screen.getByRole("option", { name: "Banana" })).toBeInTheDocument();
      expect(screen.queryByRole("option", { name: "Apple" })).not.toBeInTheDocument();
      expect(screen.queryByRole("option", { name: "Cherry" })).not.toBeInTheDocument();
    });

    it("shows no results message when no matches", async () => {
      const user = userEvent.setup();
      render(<Select value="apple" options={options} onValueChange={() => {}} searchable />);

      await user.click(screen.getByRole("button"));
      const input = screen.getByRole("combobox");

      await user.type(input, "xyz");

      expect(screen.getByText('No results for "xyz"')).toBeInTheDocument();
      expect(screen.queryByRole("option")).not.toBeInTheDocument();
    });

    it("is case-insensitive when filtering", async () => {
      const user = userEvent.setup();
      render(<Select value="apple" options={options} onValueChange={() => {}} searchable />);

      await user.click(screen.getByRole("button"));
      const input = screen.getByRole("combobox");

      await user.type(input, "BANANA");

      expect(screen.getByRole("option", { name: "Banana" })).toBeInTheDocument();
    });

    it("clears search when option is selected", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Select value="apple" options={options} onValueChange={handleChange} searchable />);

      await user.click(screen.getByRole("button"));
      const input = screen.getByRole("combobox");

      await user.type(input, "ba");
      await user.click(screen.getByRole("option", { name: "Banana" }));

      // Reopen to check search is cleared
      await user.click(screen.getByRole("button"));
      const newInput = screen.getByRole("combobox");
      expect(newInput).toHaveValue("");
    });

    it("clears search when dropdown is closed", async () => {
      const user = userEvent.setup();
      render(<Select value="apple" options={options} onValueChange={() => {}} searchable />);

      await user.click(screen.getByRole("button"));
      const input = screen.getByRole("combobox");

      await user.type(input, "test");

      // First escape clears search, second closes
      await user.keyboard("{Escape}");
      await user.keyboard("{Escape}");

      // Wait for dropdown to close and transform back to button
      expect(await screen.findByRole("button")).toBeInTheDocument();

      // Reopen to check search is cleared
      await user.click(screen.getByRole("button"));
      const newInput = screen.getByRole("combobox");
      expect(newInput).toHaveValue("");
    });

    it("clears search on first Escape, closes on second", async () => {
      const user = userEvent.setup();
      render(<Select value="apple" options={options} onValueChange={() => {}} searchable />);

      await user.click(screen.getByRole("button"));
      const input = screen.getByRole("combobox");

      await user.type(input, "test");
      expect(input).toHaveValue("test");

      // First escape clears search
      await user.keyboard("{Escape}");
      expect(screen.getByRole("combobox")).toHaveValue("");
      expect(screen.getByRole("listbox")).toBeInTheDocument(); // Still open

      // Second escape closes
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    });

    it("navigates filtered options with arrow keys", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Select value={"" as any} options={options} onValueChange={handleChange} searchable />);

      await user.click(screen.getByRole("button"));
      const input = screen.getByRole("combobox");

      await user.type(input, "ban");
      // Should show only Banana

      // Enter selects the highlighted (only) option
      await user.keyboard("{Enter}");

      // Should select Banana
      expect(handleChange).toHaveBeenCalledWith("banana");
    });

    it("opens dropdown on typing when closed", async () => {
      const user = userEvent.setup();
      render(<Select value="apple" options={options} onValueChange={() => {}} searchable />);

      const button = screen.getByRole("button");
      button.focus();

      await user.keyboard("b");

      // Should open dropdown and transform to input
      expect(screen.getByRole("combobox")).toBeInTheDocument();
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("uses selected value as placeholder in search input", async () => {
      const user = userEvent.setup();
      render(<Select value="banana" options={options} onValueChange={() => {}} searchable />);

      await user.click(screen.getByRole("button"));
      const input = screen.getByRole("combobox");

      expect(input).toHaveAttribute("placeholder", "Banana");
    });

    it("allows Space in search input", async () => {
      const user = userEvent.setup();
      const moreOptions = [
        { value: "apple-pie", label: "Apple Pie" },
        { value: "banana-split", label: "Banana Split" },
      ];
      render(<Select value="apple-pie" options={moreOptions} onValueChange={() => {}} searchable />);

      await user.click(screen.getByRole("button"));
      const input = screen.getByRole("combobox");

      await user.type(input, "Banana Split");

      expect(input).toHaveValue("Banana Split");
      expect(screen.getByRole("option", { name: "Banana Split" })).toBeInTheDocument();
    });
  });
});
