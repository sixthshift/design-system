/// <reference types="@testing-library/jest-dom" />
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ToggleGroup } from "./ToggleGroup";

const textOptions = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Bravo" },
  { value: "c", label: "Charlie" },
] as const;

describe("ToggleGroup", () => {
  // ── Rendering ────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders all options as buttons", () => {
      render(<ToggleGroup type="single" options={textOptions} aria-label="test" />);
      const buttons = screen.getAllByRole("radio");
      expect(buttons).toHaveLength(3);
      expect(buttons[0]).toHaveTextContent("Alpha");
      expect(buttons[1]).toHaveTextContent("Bravo");
      expect(buttons[2]).toHaveTextContent("Charlie");
    });

    it("forwards ref to the container div", () => {
      const ref = vi.fn();
      render(<ToggleGroup ref={ref} type="single" options={textOptions} aria-label="test" />);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    });

    it("spreads additional HTML attributes", () => {
      render(<ToggleGroup type="single" options={textOptions} data-testid="my-group" aria-label="test" />);
      expect(screen.getByTestId("my-group")).toBeInTheDocument();
    });

    it("renders ReactNode labels", () => {
      const options = [{ value: "icon", label: <span data-testid="icon-label">Icon</span> }];
      render(<ToggleGroup type="single" options={options} aria-label="test" />);
      expect(screen.getByTestId("icon-label")).toBeInTheDocument();
    });

    it("applies ariaLabel to individual items", () => {
      const options = [{ value: "x", label: <span>X</span>, ariaLabel: "Close" }];
      render(<ToggleGroup type="single" options={options} aria-label="test" />);
      expect(screen.getByRole("radio")).toHaveAttribute("aria-label", "Close");
    });
  });

  // ── Single-select a11y ───────────────────────────────────────────

  describe("single-select accessibility", () => {
    it("uses radiogroup role on the container", () => {
      render(<ToggleGroup type="single" options={textOptions} aria-label="test" />);
      expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    });

    it("uses radio role on each item", () => {
      render(<ToggleGroup type="single" options={textOptions} aria-label="test" />);
      expect(screen.getAllByRole("radio")).toHaveLength(3);
    });

    it("sets aria-checked on the selected item", () => {
      render(<ToggleGroup type="single" value="b" options={textOptions} aria-label="test" />);
      const radios = screen.getAllByRole("radio");
      expect(radios[0]).toHaveAttribute("aria-checked", "false");
      expect(radios[1]).toHaveAttribute("aria-checked", "true");
      expect(radios[2]).toHaveAttribute("aria-checked", "false");
    });
  });

  // ── Multiple-select a11y ─────────────────────────────────────────

  describe("multiple-select accessibility", () => {
    it("uses group role on the container", () => {
      render(<ToggleGroup type="multiple" options={textOptions} aria-label="test" />);
      expect(screen.getByRole("group")).toBeInTheDocument();
    });

    it("sets aria-pressed on each item", () => {
      render(<ToggleGroup type="multiple" value={["a", "c"]} options={textOptions} aria-label="test" />);
      const buttons = within(screen.getByRole("group")).getAllByRole("button");
      expect(buttons[0]).toHaveAttribute("aria-pressed", "true");
      expect(buttons[1]).toHaveAttribute("aria-pressed", "false");
      expect(buttons[2]).toHaveAttribute("aria-pressed", "true");
    });
  });

  // ── Single-select interactions ───────────────────────────────────

  describe("single-select interactions", () => {
    it("selects an option on click", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ToggleGroup type="single" onValueChange={onChange} options={textOptions} aria-label="test" />);

      await user.click(screen.getAllByRole("radio")[1]!);
      expect(onChange).toHaveBeenCalledWith("b");
    });

    it("does not deselect when clicking the already-selected option", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ToggleGroup type="single" value="b" onValueChange={onChange} options={textOptions} aria-label="test" />);

      await user.click(screen.getAllByRole("radio")[1]!);
      expect(onChange).not.toHaveBeenCalled();
    });

    it("works in uncontrolled mode with defaultValue", async () => {
      const user = userEvent.setup();
      render(<ToggleGroup type="single" defaultValue="a" options={textOptions} aria-label="test" />);

      const radios = screen.getAllByRole("radio");
      expect(radios[0]).toHaveAttribute("aria-checked", "true");

      await user.click(radios[2]!);
      expect(radios[0]).toHaveAttribute("aria-checked", "false");
      expect(radios[2]).toHaveAttribute("aria-checked", "true");
    });

    it("calls onValueChange with the new value in controlled mode", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ToggleGroup type="single" value="a" onValueChange={onChange} options={textOptions} aria-label="test" />);

      await user.click(screen.getAllByRole("radio")[2]!);
      expect(onChange).toHaveBeenCalledWith("c");
    });
  });

  // ── Multiple-select interactions ─────────────────────────────────

  describe("multiple-select interactions", () => {
    it("adds a value on click", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ToggleGroup type="multiple" value={["a"]} onValueChange={onChange} options={textOptions} aria-label="test" />);

      const buttons = within(screen.getByRole("group")).getAllByRole("button");
      await user.click(buttons[1]!);
      expect(onChange).toHaveBeenCalledWith(["a", "b"]);
    });

    it("removes a value on click when already selected", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ToggleGroup type="multiple" value={["a", "b"]} onValueChange={onChange} options={textOptions} aria-label="test" />);

      const buttons = within(screen.getByRole("group")).getAllByRole("button");
      await user.click(buttons[0]!);
      expect(onChange).toHaveBeenCalledWith(["b"]);
    });

    it("works in uncontrolled mode with defaultValue", async () => {
      const user = userEvent.setup();
      render(<ToggleGroup type="multiple" defaultValue={["a"]} options={textOptions} aria-label="test" />);

      const buttons = within(screen.getByRole("group")).getAllByRole("button");
      expect(buttons[0]).toHaveAttribute("aria-pressed", "true");
      expect(buttons[1]).toHaveAttribute("aria-pressed", "false");

      await user.click(buttons[1]!);
      expect(buttons[0]).toHaveAttribute("aria-pressed", "true");
      expect(buttons[1]).toHaveAttribute("aria-pressed", "true");

      await user.click(buttons[0]!);
      expect(buttons[0]).toHaveAttribute("aria-pressed", "false");
      expect(buttons[1]).toHaveAttribute("aria-pressed", "true");
    });
  });

  // ── Disabled ─────────────────────────────────────────────────────

  describe("disabled", () => {
    it("disables all items when group is disabled", () => {
      render(<ToggleGroup type="single" options={textOptions} disabled aria-label="test" />);
      for (const radio of screen.getAllByRole("radio")) {
        expect(radio).toBeDisabled();
      }
    });

    it("disables individual options", () => {
      const options = [
        { value: "a", label: "A" },
        { value: "b", label: "B", disabled: true },
        { value: "c", label: "C" },
      ];
      render(<ToggleGroup type="single" options={options} aria-label="test" />);
      const radios = screen.getAllByRole("radio");
      expect(radios[0]).not.toBeDisabled();
      expect(radios[1]).toBeDisabled();
      expect(radios[2]).not.toBeDisabled();
    });

    it("does not call onValueChange when a disabled option is clicked", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const options = [
        { value: "a", label: "A" },
        { value: "b", label: "B", disabled: true },
      ];
      render(<ToggleGroup type="single" onValueChange={onChange} options={options} aria-label="test" />);

      await user.click(screen.getAllByRole("radio")[1]!);
      expect(onChange).not.toHaveBeenCalled();
    });

    it("does not call onValueChange when group is disabled (multiple)", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ToggleGroup type="multiple" onValueChange={onChange} options={textOptions} disabled aria-label="test" />);

      const buttons = within(screen.getByRole("group")).getAllByRole("button");
      await user.click(buttons[0]!);
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  // ── Appearance ───────────────────────────────────────────────────

  describe("appearance", () => {
    it("renders segmented items with collapsed borders via negative margin", () => {
      render(<ToggleGroup type="single" options={textOptions} aria-label="test" />);
      const radios = screen.getAllByRole("radio");
      // First item has no negative margin, subsequent items collapse borders
      expect(radios[0]).toHaveClass("rounded-l-md");
      expect(radios[1]).toHaveClass("-ml-px");
      expect(radios[2]).toHaveClass("rounded-r-md");
    });

    it("renders separate items with gap spacing", () => {
      render(<ToggleGroup type="single" options={textOptions} appearance="separate" aria-label="test" />);
      const container = screen.getByRole("radiogroup");
      expect(container).toHaveClass("gap-2");
    });
  });

  // ── Sizing & variants ───────────────────────────────────────────

  describe("sizing and variants", () => {
    it("applies sm size class to segmented items", () => {
      render(<ToggleGroup type="single" options={textOptions} size="sm" aria-label="test" />);
      expect(screen.getAllByRole("radio")[0]).toHaveClass("h-8");
    });

    it("applies lg size class to segmented items", () => {
      render(<ToggleGroup type="single" options={textOptions} size="lg" aria-label="test" />);
      expect(screen.getAllByRole("radio")[0]).toHaveClass("h-10");
    });

    it("applies icon size class to segmented items", () => {
      render(<ToggleGroup type="single" options={textOptions} iconOnly aria-label="test" />);
      expect(screen.getAllByRole("radio")[0]).toHaveClass("w-9");
    });

    it("applies outline variant classes in separate mode", () => {
      render(<ToggleGroup type="single" options={textOptions} appearance="separate" variant="outline" aria-label="test" />);
      expect(screen.getAllByRole("radio")[0]).toHaveClass("border");
    });

    it("applies ghost variant in separate mode (no border/shadow)", () => {
      render(<ToggleGroup type="single" options={textOptions} appearance="separate" variant="ghost" aria-label="test" />);
      const button = screen.getAllByRole("radio")[0];
      expect(button).not.toHaveClass("shadow");
    });

    it("merges custom className on the container", () => {
      render(<ToggleGroup type="single" options={textOptions} className="my-custom" aria-label="test" />);
      const container = screen.getByRole("radiogroup");
      expect(container).toHaveClass("my-custom");
      expect(container).toHaveClass("inline-flex");
    });
  });

  // ── Orientation ──────────────────────────────────────────────────

  describe("orientation", () => {
    it("defaults to horizontal (flex-row)", () => {
      render(<ToggleGroup type="single" options={textOptions} aria-label="test" />);
      expect(screen.getByRole("radiogroup")).toHaveClass("flex-row");
    });

    it("applies vertical layout (flex-col)", () => {
      render(<ToggleGroup type="single" options={textOptions} orientation="vertical" aria-label="test" />);
      expect(screen.getByRole("radiogroup")).toHaveClass("flex-col");
    });
  });

  describe("single mode roving focus", () => {
    const opts = [
      { value: "a", label: "A" },
      { value: "b", label: "B" },
      { value: "c", label: "C" },
    ];

    it("is a single tab stop", () => {
      render(<ToggleGroup type="single" options={opts} value="b" onValueChange={() => {}} />);
      const radios = screen.getAllByRole("radio");
      expect(radios.filter((radio) => radio.getAttribute("tabindex") === "0")).toHaveLength(1);
      expect(radios[1]).toHaveAttribute("tabindex", "0");
    });

    it("falls back to the first option as tab stop when nothing is selected", () => {
      render(<ToggleGroup type="single" options={opts} value="" onValueChange={() => {}} />);
      expect(screen.getAllByRole("radio")[0]).toHaveAttribute("tabindex", "0");
    });

    it("moves selection with ArrowRight", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<ToggleGroup type="single" options={opts} value="a" onValueChange={handleChange} />);

      await user.tab();
      await user.keyboard("{ArrowRight}");
      expect(handleChange).toHaveBeenLastCalledWith("b");
      expect(screen.getAllByRole("radio")[1]).toHaveFocus();
    });

    it("wraps backward from the first option with ArrowLeft", async () => {
      const user = userEvent.setup();
      render(<ToggleGroup type="single" options={opts} value="a" onValueChange={() => {}} />);
      const radios = screen.getAllByRole("radio");

      await user.tab();
      await user.keyboard("{ArrowLeft}");
      expect(radios[radios.length - 1]).toHaveFocus();
    });

    it("skips disabled options", async () => {
      const user = userEvent.setup();
      const withDisabled = [
        { value: "a", label: "A" },
        { value: "b", label: "B", disabled: true },
        { value: "c", label: "C" },
      ];
      render(<ToggleGroup type="single" options={withDisabled} value="a" onValueChange={() => {}} />);

      await user.tab();
      await user.keyboard("{ArrowRight}");
      expect(screen.getByRole("radio", { name: "C" })).toHaveFocus();
    });
  });
});
