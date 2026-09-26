/// <reference types="@testing-library/jest-dom" />
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Steps } from "./Steps";

const STEPS = [{ label: "Cake" }, { label: "Date", description: "Pickup or delivery" }, { label: "Details" }, { label: "Pay" }];

describe("Steps", () => {
  describe("rendering", () => {
    it("renders an ordered list with one item per step", () => {
      render(<Steps aria-label="Checkout progress" steps={STEPS} current={1} />);
      const list = screen.getByRole("list", { name: "Checkout progress" });
      expect(list.tagName).toBe("OL");
      expect(within(list).getAllByRole("listitem")).toHaveLength(4);
    });

    it("forwards ref to the list", () => {
      const ref = vi.fn();
      render(<Steps steps={STEPS} current={0} ref={ref} />);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLOListElement));
    });

    it("renders descriptions", () => {
      render(<Steps steps={STEPS} current={0} />);
      expect(screen.getByText("Pickup or delivery")).toBeInTheDocument();
    });

    it("merges className last", () => {
      render(<Steps aria-label="Progress" steps={STEPS} current={0} className="custom" />);
      expect(screen.getByRole("list")).toHaveClass("steps", "custom");
    });

    it("renders the orientation as a data attribute", () => {
      render(<Steps aria-label="Progress" steps={STEPS} current={0} orientation="vertical" />);
      expect(screen.getByRole("list")).toHaveAttribute("data-orientation", "vertical");
    });
  });

  describe("state", () => {
    it("marks steps before current complete, current current, and the rest upcoming", () => {
      render(<Steps steps={STEPS} current={2} />);
      const states = screen.getAllByRole("listitem").map((item) => item.getAttribute("data-state"));
      expect(states).toEqual(["complete", "complete", "current", "upcoming"]);
    });

    it("sets aria-current only on the current step", () => {
      render(<Steps steps={STEPS} current={1} />);
      const items = screen.getAllByRole("listitem");
      expect(items[1]).toHaveAttribute("aria-current", "step");
      expect(items.filter((item) => item.hasAttribute("aria-current"))).toHaveLength(1);
    });

    it("announces status in text, not only colour", () => {
      render(<Steps steps={STEPS} current={1} />);
      const [first, second, third] = screen.getAllByRole("listitem");
      expect(first).toHaveTextContent("(completed)");
      expect(second).toHaveTextContent("(current)");
      expect(third).not.toHaveTextContent(/\(/);
    });

    it("marks every step complete when current is past the end", () => {
      render(<Steps steps={STEPS} current={STEPS.length} />);
      for (const item of screen.getAllByRole("listitem")) expect(item).toHaveAttribute("data-state", "complete");
    });

    it("shows the step number on incomplete steps", () => {
      render(<Steps steps={STEPS} current={1} />);
      const items = screen.getAllByRole("listitem");
      expect(items[1]).toHaveTextContent("2");
      expect(items[3]).toHaveTextContent("4");
    });
  });

  describe("onStepClick", () => {
    it("renders no buttons without it", () => {
      render(<Steps steps={STEPS} current={2} />);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("makes only completed steps buttons", () => {
      render(<Steps steps={STEPS} current={2} onStepClick={() => {}} />);
      expect(screen.getAllByRole("button")).toHaveLength(2);
    });

    it("reports the clicked step's index", async () => {
      const user = userEvent.setup();
      const onStepClick = vi.fn();
      render(<Steps steps={STEPS} current={2} onStepClick={onStepClick} />);

      await user.click(screen.getByRole("button", { name: /Date/ }));
      expect(onStepClick).toHaveBeenCalledWith(1);
    });
  });
});
