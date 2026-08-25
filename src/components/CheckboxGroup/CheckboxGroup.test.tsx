/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CheckboxGroup } from "./CheckboxGroup";

const options = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "push", label: "Push" },
] as const;

describe("CheckboxGroup", () => {
  describe("rendering", () => {
    it("renders a group container with the group role", () => {
      render(<CheckboxGroup options={options} />);
      expect(screen.getByRole("group")).toBeInTheDocument();
    });

    it("renders a checkbox for each option", () => {
      render(<CheckboxGroup options={options} />);
      expect(screen.getAllByRole("checkbox")).toHaveLength(3);
    });

    it("renders each option's label", () => {
      render(<CheckboxGroup options={options} />);
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("SMS")).toBeInTheDocument();
      expect(screen.getByText("Push")).toBeInTheDocument();
    });

    it("forwards ref to the group container", () => {
      const ref = vi.fn();
      render(<CheckboxGroup options={options} ref={ref} />);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    });

    it("spreads additional props to the group container", () => {
      render(<CheckboxGroup options={options} data-testid="notification-group" />);
      expect(screen.getByTestId("notification-group")).toBeInTheDocument();
    });

    it("renders no checkboxes for an empty options array", () => {
      render(<CheckboxGroup options={[]} />);
      expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    });

    it("renders a single checkbox for a single option", () => {
      render(<CheckboxGroup options={[{ value: "email", label: "Email" }]} />);
      expect(screen.getAllByRole("checkbox")).toHaveLength(1);
    });
  });

  describe("uncontrolled mode", () => {
    it("starts with no options checked by default", () => {
      render(<CheckboxGroup options={options} />);
      for (const checkbox of screen.getAllByRole("checkbox")) {
        expect(checkbox).toHaveAttribute("aria-checked", "false");
      }
    });

    it("respects defaultValue", () => {
      render(<CheckboxGroup options={options} defaultValue={["sms"]} />);
      expect(screen.getByRole("checkbox", { name: "SMS" })).toHaveAttribute("aria-checked", "true");
      expect(screen.getByRole("checkbox", { name: "Email" })).toHaveAttribute("aria-checked", "false");
    });

    it("toggles its own state when clicked without a value prop", async () => {
      const user = userEvent.setup();
      render(<CheckboxGroup options={options} />);

      const emailCheckbox = screen.getByRole("checkbox", { name: "Email" });
      await user.click(emailCheckbox);
      expect(emailCheckbox).toHaveAttribute("aria-checked", "true");

      await user.click(emailCheckbox);
      expect(emailCheckbox).toHaveAttribute("aria-checked", "false");
    });
  });

  describe("controlled mode", () => {
    it("reflects the controlled value", () => {
      render(<CheckboxGroup options={options} value={["email", "push"]} onValueChange={() => {}} />);
      expect(screen.getByRole("checkbox", { name: "Email" })).toHaveAttribute("aria-checked", "true");
      expect(screen.getByRole("checkbox", { name: "SMS" })).toHaveAttribute("aria-checked", "false");
      expect(screen.getByRole("checkbox", { name: "Push" })).toHaveAttribute("aria-checked", "true");
    });

    it("does not change state on its own when controlled", async () => {
      const user = userEvent.setup();
      render(<CheckboxGroup options={options} value={["email"]} onValueChange={() => {}} />);

      const smsCheckbox = screen.getByRole("checkbox", { name: "SMS" });
      await user.click(smsCheckbox);
      // Parent did not update `value`, so the checkbox should remain unchecked.
      expect(smsCheckbox).toHaveAttribute("aria-checked", "false");
    });
  });

  describe("onValueChange payload", () => {
    it("calls onValueChange with the option appended when checking an unchecked option", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<CheckboxGroup options={options} value={["email"]} onValueChange={handleChange} />);

      await user.click(screen.getByRole("checkbox", { name: "SMS" }));
      expect(handleChange).toHaveBeenCalledWith(["email", "sms"]);
    });

    it("calls onValueChange with the option removed when unchecking a checked option", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<CheckboxGroup options={options} value={["email", "sms"]} onValueChange={handleChange} />);

      await user.click(screen.getByRole("checkbox", { name: "Email" }));
      expect(handleChange).toHaveBeenCalledWith(["sms"]);
    });

    it("calls onValueChange with an empty array when unchecking the only checked option", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<CheckboxGroup options={options} value={["email"]} onValueChange={handleChange} />);

      await user.click(screen.getByRole("checkbox", { name: "Email" }));
      expect(handleChange).toHaveBeenCalledWith([]);
    });
  });

  describe("disabled state", () => {
    it("disables an individual option via option.disabled", () => {
      render(
        <CheckboxGroup
          options={[
            { value: "email", label: "Email" },
            { value: "sms", label: "SMS", disabled: true },
          ]}
        />
      );
      expect(screen.getByRole("checkbox", { name: "Email" })).not.toBeDisabled();
      expect(screen.getByRole("checkbox", { name: "SMS" })).toBeDisabled();
    });

    it("disables all options via the disabled prop", () => {
      render(<CheckboxGroup options={options} disabled />);
      for (const checkbox of screen.getAllByRole("checkbox")) {
        expect(checkbox).toBeDisabled();
      }
    });

    it("does not call onValueChange when clicking a disabled option", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <CheckboxGroup
          options={[
            { value: "email", label: "Email" },
            { value: "sms", label: "SMS", disabled: true },
          ]}
          onValueChange={handleChange}
        />
      );

      await user.click(screen.getByRole("checkbox", { name: "SMS" }));
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe("orientation", () => {
    it("applies vertical layout classes by default", () => {
      render(<CheckboxGroup options={options} />);
      expect(screen.getByRole("group")).toHaveClass("flex-col");
    });

    it("applies horizontal layout classes when orientation='horizontal'", () => {
      render(<CheckboxGroup options={options} orientation="horizontal" />);
      expect(screen.getByRole("group")).toHaveClass("flex-row");
    });
  });

  describe("button variant", () => {
    it("still exposes checkbox semantics", () => {
      render(<CheckboxGroup options={options} variant="button" />);
      expect(screen.getAllByRole("checkbox")).toHaveLength(3);
    });

    it("toggles a checkbox when clicked", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<CheckboxGroup options={options} variant="button" value={[]} onValueChange={handleChange} />);

      await user.click(screen.getByRole("checkbox", { name: "Email" }));
      expect(handleChange).toHaveBeenCalledWith(["email"]);
    });

    it("applies segmented appearance classes by default", () => {
      render(<CheckboxGroup options={options} variant="button" orientation="horizontal" />);
      const firstOption = screen.getByRole("checkbox", { name: "Email" });
      expect(firstOption).toHaveClass("border");
      expect(firstOption).toHaveClass("rounded-l-md");
    });

    it("applies separate appearance classes", () => {
      render(<CheckboxGroup options={options} variant="button" appearance="separate" />);
      const firstOption = screen.getByRole("checkbox", { name: "Email" });
      expect(firstOption).toHaveClass("rounded-md");
    });

    it("applies checked styling to a selected button option", () => {
      render(<CheckboxGroup options={options} variant="button" value={["email"]} onValueChange={() => {}} />);
      expect(screen.getByRole("checkbox", { name: "Email" })).toHaveClass("bg-bg-brand");
    });
  });

  describe("keyboard interaction", () => {
    it("can be focused via Tab", async () => {
      const user = userEvent.setup();
      render(<CheckboxGroup options={options} />);

      await user.tab();
      expect(screen.getByRole("checkbox", { name: "Email" })).toHaveFocus();
    });

    it("toggles the focused checkbox with Space", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<CheckboxGroup options={options} value={[]} onValueChange={handleChange} />);

      await user.tab();
      await user.keyboard(" ");
      expect(handleChange).toHaveBeenCalledWith(["email"]);
    });
  });

  describe("blur behavior", () => {
    it("calls onBlur when focus leaves the group entirely", async () => {
      const user = userEvent.setup();
      const handleBlur = vi.fn();
      render(
        <>
          <CheckboxGroup options={options} onBlur={handleBlur} />
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
      render(<CheckboxGroup options={options} onBlur={handleBlur} />);

      await user.tab();
      await user.tab();
      expect(handleBlur).not.toHaveBeenCalled();
    });
  });

  describe("form integration", () => {
    it("renders a hidden input for each option when name is provided", () => {
      render(<CheckboxGroup options={options} value={["email", "push"]} onValueChange={() => {}} name="notifications" />);
      const hiddenInputs = document.querySelectorAll('input[type="checkbox"]');
      expect(hiddenInputs).toHaveLength(3);
    });

    it("hidden inputs reflect each option's checked state", () => {
      render(<CheckboxGroup options={options} value={["email", "push"]} onValueChange={() => {}} name="notifications" />);
      const hiddenInputs = Array.from(document.querySelectorAll('input[type="checkbox"]')) as HTMLInputElement[];
      const byValue = Object.fromEntries(hiddenInputs.map((input) => [input.value, input.checked]));
      expect(byValue).toEqual({ email: true, sms: false, push: true });
    });

    it("does not render hidden inputs when name is not provided", () => {
      render(<CheckboxGroup options={options} value={["email"]} onValueChange={() => {}} />);
      expect(document.querySelector('input[type="checkbox"]')).not.toBeInTheDocument();
    });

    it("renders a hidden input only for checked options in the button variant", () => {
      render(<CheckboxGroup options={options} variant="button" value={["email", "push"]} onValueChange={() => {}} name="notifications" />);
      const hiddenInputs = document.querySelectorAll('input[name="notifications"]');
      expect(hiddenInputs).toHaveLength(2);
    });
  });

  describe("className merging", () => {
    it("merges custom className with default classes", () => {
      render(<CheckboxGroup options={options} className="custom-class" />);
      const group = screen.getByRole("group");
      expect(group).toHaveClass("custom-class");
      expect(group).toHaveClass("flex");
    });
  });
});
