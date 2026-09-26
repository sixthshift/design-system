/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { NumberStepper } from "./NumberStepper";

describe("NumberStepper", () => {
  describe("rendering", () => {
    it("renders a spinbutton with its value and bounds", () => {
      render(<NumberStepper aria-label="Quantity" defaultValue={2} min={1} max={5} />);
      const input = screen.getByRole("spinbutton", { name: "Quantity" });
      expect(input).toHaveValue("2");
      expect(input).toHaveAttribute("aria-valuenow", "2");
      expect(input).toHaveAttribute("aria-valuemin", "1");
      expect(input).toHaveAttribute("aria-valuemax", "5");
    });

    it("defaults to min when no value is given", () => {
      render(<NumberStepper aria-label="Quantity" min={3} />);
      expect(screen.getByRole("spinbutton")).toHaveValue("3");
    });

    it("clamps an out-of-range defaultValue", () => {
      render(<NumberStepper aria-label="Quantity" defaultValue={99} max={10} />);
      expect(screen.getByRole("spinbutton")).toHaveValue("10");
    });

    it("forwards ref to the input", () => {
      const ref = vi.fn();
      render(<NumberStepper aria-label="Quantity" ref={ref} />);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
    });

    it("puts className on the group and spreads other props onto the input", () => {
      render(<NumberStepper aria-label="Quantity" className="custom" id="qty" name="qty" />);
      const input = screen.getByRole("spinbutton");
      expect(input).toHaveAttribute("id", "qty");
      expect(input).toHaveAttribute("name", "qty");
      expect(screen.getByRole("group")).toHaveClass("number-stepper", "custom");
    });

    it("keeps the buttons out of the tab order", () => {
      render(<NumberStepper aria-label="Quantity" />);
      for (const button of screen.getAllByRole("button")) {
        expect(button).toHaveAttribute("tabindex", "-1");
      }
    });

    it("uses custom button labels", () => {
      render(<NumberStepper aria-label="Quantity" decrementLabel="One fewer" incrementLabel="One more" />);
      expect(screen.getByRole("button", { name: "One fewer" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "One more" })).toBeInTheDocument();
    });
  });

  describe("buttons", () => {
    it("increments and decrements by step", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<NumberStepper aria-label="Quantity" defaultValue={4} step={2} max={10} onValueChange={onValueChange} />);

      await user.click(screen.getByRole("button", { name: "Increase" }));
      expect(onValueChange).toHaveBeenLastCalledWith(6);
      await user.click(screen.getByRole("button", { name: "Decrease" }));
      expect(onValueChange).toHaveBeenLastCalledWith(4);
      expect(screen.getByRole("spinbutton")).toHaveValue("4");
    });

    it("disables each button at its bound", () => {
      const { rerender } = render(<NumberStepper aria-label="Quantity" value={1} min={1} max={3} onValueChange={() => {}} />);
      expect(screen.getByRole("button", { name: "Decrease" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Increase" })).toBeEnabled();

      rerender(<NumberStepper aria-label="Quantity" value={3} min={1} max={3} onValueChange={() => {}} />);
      expect(screen.getByRole("button", { name: "Increase" })).toBeDisabled();
    });

    it("disables both buttons and the input when disabled", () => {
      render(<NumberStepper aria-label="Quantity" defaultValue={2} disabled />);
      expect(screen.getByRole("spinbutton")).toBeDisabled();
      expect(screen.getByRole("button", { name: "Decrease" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Increase" })).toBeDisabled();
    });

    it("disables the buttons but not the input when readOnly", () => {
      render(<NumberStepper aria-label="Quantity" defaultValue={2} readOnly />);
      expect(screen.getByRole("spinbutton")).toHaveAttribute("readonly");
      expect(screen.getByRole("button", { name: "Increase" })).toBeDisabled();
    });
  });

  describe("keyboard", () => {
    it("steps with the arrow keys and by ten with PageUp/PageDown", async () => {
      const user = userEvent.setup();
      render(<NumberStepper aria-label="Quantity" defaultValue={20} />);
      const input = screen.getByRole("spinbutton");
      input.focus();

      await user.keyboard("{ArrowUp}");
      expect(input).toHaveValue("21");
      await user.keyboard("{ArrowDown}{ArrowDown}");
      expect(input).toHaveValue("19");
      await user.keyboard("{PageUp}");
      expect(input).toHaveValue("29");
      await user.keyboard("{PageDown}");
      expect(input).toHaveValue("19");
    });

    it("jumps to the bounds with Home and End", async () => {
      const user = userEvent.setup();
      render(<NumberStepper aria-label="Quantity" defaultValue={5} min={1} max={12} />);
      const input = screen.getByRole("spinbutton");
      input.focus();

      await user.keyboard("{End}");
      expect(input).toHaveValue("12");
      await user.keyboard("{Home}");
      expect(input).toHaveValue("1");
    });

    it("clamps keyboard steps to the bounds", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<NumberStepper aria-label="Quantity" defaultValue={9} max={10} onValueChange={onValueChange} />);
      screen.getByRole("spinbutton").focus();

      await user.keyboard("{PageUp}");
      expect(onValueChange).toHaveBeenLastCalledWith(10);
      onValueChange.mockClear();
      await user.keyboard("{ArrowUp}");
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it("lets a consumer's onKeyDown pre-empt the default", async () => {
      const user = userEvent.setup();
      render(<NumberStepper aria-label="Quantity" defaultValue={1} onKeyDown={(event) => event.preventDefault()} />);
      screen.getByRole("spinbutton").focus();
      await user.keyboard("{ArrowUp}");
      expect(screen.getByRole("spinbutton")).toHaveValue("1");
    });
  });

  describe("typing", () => {
    it("commits a typed value on blur", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<NumberStepper aria-label="Quantity" defaultValue={1} onValueChange={onValueChange} />);
      const input = screen.getByRole("spinbutton");

      await user.clear(input);
      await user.type(input, "7");
      expect(onValueChange).not.toHaveBeenCalled();
      await user.tab();
      expect(onValueChange).toHaveBeenCalledWith(7);
      expect(input).toHaveValue("7");
    });

    it("commits on Enter", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<NumberStepper aria-label="Quantity" defaultValue={1} onValueChange={onValueChange} />);
      const input = screen.getByRole("spinbutton");

      await user.clear(input);
      await user.type(input, "4{Enter}");
      expect(onValueChange).toHaveBeenCalledWith(4);
    });

    it("clamps and snaps a typed value to the step grid", async () => {
      const user = userEvent.setup();
      render(<NumberStepper aria-label="Guests" defaultValue={2} min={2} max={20} step={2} />);
      const input = screen.getByRole("spinbutton");

      await user.clear(input);
      await user.type(input, "7{Enter}");
      expect(input).toHaveValue("8");

      await user.clear(input);
      await user.type(input, "500{Enter}");
      expect(input).toHaveValue("20");
    });

    it("reverts unparseable text without reporting", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<NumberStepper aria-label="Quantity" defaultValue={3} onValueChange={onValueChange} />);
      const input = screen.getByRole("spinbutton");

      await user.clear(input);
      await user.type(input, "abc");
      await user.tab();
      expect(input).toHaveValue("3");
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it("still calls the consumer's onBlur", async () => {
      const user = userEvent.setup();
      const onBlur = vi.fn();
      render(<NumberStepper aria-label="Quantity" onBlur={onBlur} />);
      await user.click(screen.getByRole("spinbutton"));
      await user.tab();
      expect(onBlur).toHaveBeenCalledOnce();
    });
  });

  describe("controlled", () => {
    it("follows the value prop", async () => {
      const user = userEvent.setup();
      function Controlled() {
        const [value, setValue] = useState(1);
        return (
          <>
            <NumberStepper aria-label="Quantity" value={value} onValueChange={setValue} />
            <output>{value}</output>
          </>
        );
      }
      render(<Controlled />);

      await user.click(screen.getByRole("button", { name: "Increase" }));
      expect(screen.getByRole("status")).toHaveTextContent("2");
      expect(screen.getByRole("spinbutton")).toHaveValue("2");
    });

    it("does not change without the parent updating value", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<NumberStepper aria-label="Quantity" value={1} onValueChange={onValueChange} />);

      await user.click(screen.getByRole("button", { name: "Increase" }));
      expect(onValueChange).toHaveBeenCalledWith(2);
      expect(screen.getByRole("spinbutton")).toHaveValue("1");
    });
  });
});
