/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { RadioButtonGroup } from "./RadioButtonGroup";

const options = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "enterprise", label: "Enterprise" },
] as const;

describe("RadioButtonGroup", () => {
  describe("rendering", () => {
    it("renders a group container with the radiogroup role", () => {
      render(<RadioButtonGroup options={options} />);
      expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    });

    it("renders a radio for each option", () => {
      render(<RadioButtonGroup options={options} />);
      expect(screen.getAllByRole("radio")).toHaveLength(3);
    });

    it("renders each option's label", () => {
      render(<RadioButtonGroup options={options} />);
      expect(screen.getByText("Free")).toBeInTheDocument();
      expect(screen.getByText("Pro")).toBeInTheDocument();
      expect(screen.getByText("Enterprise")).toBeInTheDocument();
    });

    it("forwards ref to the group container", () => {
      const ref = vi.fn();
      render(<RadioButtonGroup options={options} ref={ref} />);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    });

    it("spreads additional props to the group container", () => {
      render(<RadioButtonGroup options={options} data-testid="plan-group" />);
      expect(screen.getByTestId("plan-group")).toBeInTheDocument();
    });

    it("renders no radios for an empty options array", () => {
      render(<RadioButtonGroup options={[]} />);
      expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    });

    it("renders a single radio for a single option", () => {
      render(<RadioButtonGroup options={[{ value: "free", label: "Free" }]} />);
      expect(screen.getAllByRole("radio")).toHaveLength(1);
    });
  });

  describe("uncontrolled mode", () => {
    it("starts with no option selected by default", () => {
      render(<RadioButtonGroup options={options} />);
      for (const radio of screen.getAllByRole("radio")) {
        expect(radio).toHaveAttribute("aria-checked", "false");
      }
    });

    it("respects defaultValue", () => {
      render(<RadioButtonGroup options={options} defaultValue="pro" />);
      expect(screen.getByRole("radio", { name: "Pro" })).toHaveAttribute("aria-checked", "true");
      expect(screen.getByRole("radio", { name: "Free" })).toHaveAttribute("aria-checked", "false");
    });

    it("selects an option when clicked without a value prop", async () => {
      const user = userEvent.setup();
      render(<RadioButtonGroup options={options} />);

      const proRadio = screen.getByRole("radio", { name: "Pro" });
      await user.click(proRadio);
      expect(proRadio).toHaveAttribute("aria-checked", "true");
    });

    it("moves selection between options in uncontrolled mode", async () => {
      const user = userEvent.setup();
      render(<RadioButtonGroup options={options} defaultValue="free" />);

      await user.click(screen.getByRole("radio", { name: "Pro" }));
      expect(screen.getByRole("radio", { name: "Pro" })).toHaveAttribute("aria-checked", "true");
      expect(screen.getByRole("radio", { name: "Free" })).toHaveAttribute("aria-checked", "false");
    });
  });

  describe("controlled mode", () => {
    it("reflects the controlled value", () => {
      render(<RadioButtonGroup options={options} value="pro" onValueChange={() => {}} />);
      expect(screen.getByRole("radio", { name: "Pro" })).toHaveAttribute("aria-checked", "true");
      expect(screen.getByRole("radio", { name: "Free" })).toHaveAttribute("aria-checked", "false");
      expect(screen.getByRole("radio", { name: "Enterprise" })).toHaveAttribute("aria-checked", "false");
    });

    it("does not change selection on its own when controlled", async () => {
      const user = userEvent.setup();
      render(<RadioButtonGroup options={options} value="free" onValueChange={() => {}} />);

      const proRadio = screen.getByRole("radio", { name: "Pro" });
      await user.click(proRadio);
      // Parent did not update `value`, so selection should remain unchanged.
      expect(proRadio).toHaveAttribute("aria-checked", "false");
      expect(screen.getByRole("radio", { name: "Free" })).toHaveAttribute("aria-checked", "true");
    });
  });

  describe("onValueChange payload", () => {
    it("calls onValueChange with the clicked option's value", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<RadioButtonGroup options={options} value="free" onValueChange={handleChange} />);

      await user.click(screen.getByRole("radio", { name: "Enterprise" }));
      expect(handleChange).toHaveBeenCalledWith("enterprise");
    });

    it("calls onValueChange even when clicking the already-selected option", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<RadioButtonGroup options={options} value="free" onValueChange={handleChange} />);

      await user.click(screen.getByRole("radio", { name: "Free" }));
      expect(handleChange).toHaveBeenCalledWith("free");
    });
  });

  describe("disabled state", () => {
    it("disables an individual option via option.disabled", () => {
      render(
        <RadioButtonGroup
          options={[
            { value: "free", label: "Free" },
            { value: "pro", label: "Pro", disabled: true },
          ]}
        />
      );
      expect(screen.getByRole("radio", { name: "Free" })).not.toBeDisabled();
      expect(screen.getByRole("radio", { name: "Pro" })).toBeDisabled();
    });

    it("disables all options via the disabled prop", () => {
      render(<RadioButtonGroup options={options} disabled />);
      for (const radio of screen.getAllByRole("radio")) {
        expect(radio).toBeDisabled();
      }
    });

    it("does not call onValueChange when clicking a disabled option", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <RadioButtonGroup
          options={[
            { value: "free", label: "Free" },
            { value: "pro", label: "Pro", disabled: true },
          ]}
          onValueChange={handleChange}
        />
      );

      await user.click(screen.getByRole("radio", { name: "Pro" }));
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe("orientation", () => {
    it("applies vertical layout classes by default", () => {
      render(<RadioButtonGroup options={options} />);
      expect(screen.getByRole("radiogroup")).toHaveClass("flex-col");
    });

    it("applies horizontal layout classes when orientation='horizontal'", () => {
      render(<RadioButtonGroup options={options} orientation="horizontal" />);
      expect(screen.getByRole("radiogroup")).toHaveClass("flex-row");
    });
  });

  describe("button variant", () => {
    it("still exposes radio semantics", () => {
      render(<RadioButtonGroup options={options} variant="button" />);
      expect(screen.getAllByRole("radio")).toHaveLength(3);
    });

    it("selects an option when clicked", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<RadioButtonGroup options={options} variant="button" value="free" onValueChange={handleChange} />);

      await user.click(screen.getByRole("radio", { name: "Pro" }));
      expect(handleChange).toHaveBeenCalledWith("pro");
    });

    it("applies segmented appearance classes by default", () => {
      render(<RadioButtonGroup options={options} variant="button" orientation="horizontal" />);
      const firstOption = screen.getByRole("radio", { name: "Free" });
      expect(firstOption).toHaveClass("border");
      expect(firstOption).toHaveClass("rounded-l-md");
    });

    it("applies separate appearance classes", () => {
      render(<RadioButtonGroup options={options} variant="button" appearance="separate" />);
      const firstOption = screen.getByRole("radio", { name: "Free" });
      expect(firstOption).toHaveClass("rounded-md");
    });

    it("applies checked styling to the selected button option", () => {
      render(<RadioButtonGroup options={options} variant="button" value="free" onValueChange={() => {}} />);
      expect(screen.getByRole("radio", { name: "Free" })).toHaveClass("bg-bg-brand");
    });
  });

  describe("keyboard interaction", () => {
    it("can be focused via Tab", async () => {
      const user = userEvent.setup();
      render(<RadioButtonGroup options={options} />);

      await user.tab();
      expect(screen.getByRole("radio", { name: "Free" })).toHaveFocus();
    });

    it("selects the focused option with Space", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<RadioButtonGroup options={options} value="free" onValueChange={handleChange} />);

      await user.tab();
      await user.tab();
      await user.keyboard(" ");
      expect(handleChange).toHaveBeenCalledWith("pro");
    });
  });

  describe("blur behavior", () => {
    it("calls onBlur when focus leaves the group entirely", async () => {
      const user = userEvent.setup();
      const handleBlur = vi.fn();
      render(
        <>
          <RadioButtonGroup options={options} onBlur={handleBlur} />
          <button type="button">Outside</button>
        </>
      );

      await user.tab();
      await user.tab();
      await user.tab();
      await user.tab();
      expect(handleBlur).toHaveBeenCalled();
    });

    it("does not call onBlur when focus moves between options within the group", async () => {
      const user = userEvent.setup();
      const handleBlur = vi.fn();
      render(<RadioButtonGroup options={options} onBlur={handleBlur} />);

      await user.tab();
      await user.tab();
      expect(handleBlur).not.toHaveBeenCalled();
    });
  });

  describe("form integration", () => {
    it("renders a hidden radio input for each option when name is provided", () => {
      render(<RadioButtonGroup options={options} value="pro" onValueChange={() => {}} name="plan" />);
      const hiddenInputs = document.querySelectorAll('input[type="radio"]');
      expect(hiddenInputs).toHaveLength(3);
    });

    it("only the selected option's hidden input is checked", () => {
      render(<RadioButtonGroup options={options} value="pro" onValueChange={() => {}} name="plan" />);
      const hiddenInputs = Array.from(document.querySelectorAll('input[type="radio"]')) as HTMLInputElement[];
      const byValue = Object.fromEntries(hiddenInputs.map((input) => [input.value, input.checked]));
      expect(byValue).toEqual({ free: false, pro: true, enterprise: false });
    });

    it("does not render hidden inputs when name is not provided", () => {
      render(<RadioButtonGroup options={options} value="free" onValueChange={() => {}} />);
      expect(document.querySelector('input[type="radio"]')).not.toBeInTheDocument();
    });

    it("renders a single hidden input carrying the selected value in the button variant", () => {
      render(<RadioButtonGroup options={options} variant="button" value="pro" onValueChange={() => {}} name="plan" />);
      const hiddenInput = document.querySelector('input[name="plan"]') as HTMLInputElement;
      expect(hiddenInput).toBeInTheDocument();
      expect(hiddenInput).toHaveValue("pro");
    });
  });

  describe("className merging", () => {
    it("merges custom className with default classes", () => {
      render(<RadioButtonGroup options={options} className="custom-class" />);
      const group = screen.getByRole("radiogroup");
      expect(group).toHaveClass("custom-class");
      expect(group).toHaveClass("flex");
    });
  });
});
