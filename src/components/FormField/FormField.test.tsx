/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FormField, useFormField } from "./FormField";

describe("FormField", () => {
  describe("rendering", () => {
    it("renders label with correct htmlFor attribute", () => {
      render(
        <FormField label="Email" id="email-field">
          <input type="email" />
        </FormField>
      );

      const label = screen.getByText("Email");
      expect(label).toBeInTheDocument();
      expect(label).toHaveAttribute("for", "email-field");
    });

    it("shows required indicator when required prop is true", () => {
      render(
        <FormField label="Email" required>
          <input type="email" />
        </FormField>
      );

      expect(screen.getByText("*")).toBeInTheDocument();
    });

    it("renders description when provided", () => {
      render(
        <FormField label="Email" description="We'll never share your email">
          <input type="email" />
        </FormField>
      );

      expect(screen.getByText("We'll never share your email")).toBeInTheDocument();
    });

    it("renders children", () => {
      render(
        <FormField label="Email">
          <input type="email" data-testid="email-input" />
        </FormField>
      );

      expect(screen.getByTestId("email-input")).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("injects id into child input element", () => {
      render(
        <FormField label="Email" id="email-field">
          <input type="email" />
        </FormField>
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("id", "email-field");
    });

    it("sets aria-describedby on child when description is provided", () => {
      render(
        <FormField label="Email" id="email-field" description="Enter your email">
          <input type="email" />
        </FormField>
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-describedby", expect.stringContaining("email-field-description"));
    });

    it("sets aria-invalid on child when feedback has danger intent", () => {
      render(
        <FormField label="Email" id="email-field" feedback={{ message: "Invalid email", intent: "danger" }}>
          <input type="email" />
        </FormField>
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-invalid", "true");
    });
  });

  describe("feedback", () => {
    it("renders feedback message with correct intent", () => {
      render(
        <FormField label="Email" feedback={{ message: "Email is valid", intent: "success" }}>
          <input type="email" />
        </FormField>
      );

      expect(screen.getByText("Email is valid")).toBeInTheDocument();
    });
  });

  describe("ref forwarding", () => {
    it("forwards ref to the container div", () => {
      const ref = vi.fn();
      render(
        <FormField label="Email" ref={ref}>
          <input type="email" />
        </FormField>
      );

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    });
  });
});

describe("attribute merging", () => {
  it("keeps a child's own id and points the label at it", () => {
    render(
      <FormField label="Email">
        <input type="email" id="my-own-id" />
      </FormField>
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("id", "my-own-id");
    expect(screen.getByText("Email")).toHaveAttribute("for", "my-own-id");
  });

  it("appends its ids to a child's existing aria-describedby instead of replacing it", () => {
    render(
      <FormField label="Email" id="email-field" description="Enter your email">
        <input type="email" aria-describedby="external-hint" />
      </FormField>
    );

    const describedBy = screen.getByRole("textbox").getAttribute("aria-describedby");
    expect(describedBy).toContain("external-hint");
    expect(describedBy).toContain("email-field-description");
  });

  it("sets aria-required on the control when required", () => {
    render(
      <FormField label="Email" required>
        <input type="email" />
      </FormField>
    );

    expect(screen.getByRole("textbox")).toHaveAttribute("aria-required", "true");
  });

  it("wires only the first element child, not every sibling", () => {
    render(
      <FormField label="Email" id="email-field">
        <input type="email" />
        <button type="button">Verify</button>
      </FormField>
    );

    expect(screen.getByRole("textbox")).toHaveAttribute("id", "email-field");
    expect(screen.getByRole("button")).not.toHaveAttribute("id");
  });
});

describe("useFormField", () => {
  it("exposes the field wiring to nested consumers", () => {
    let seen: ReturnType<typeof useFormField> = null;
    const Probe = () => {
      seen = useFormField();
      return <input id={seen?.id} aria-describedby={seen?.describedBy} />;
    };

    render(
      <FormField label="Email" id="email-field" description="Enter your email" required feedback={{ message: "Bad", intent: "danger" }}>
        <div>
          <Probe />
        </div>
      </FormField>
    );

    expect(seen).toMatchObject({ invalid: true, required: true });
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-describedby", expect.stringContaining("email-field-feedback"));
    expect(screen.getByText("Email")).toHaveAttribute("for", screen.getByRole("textbox").getAttribute("id") ?? "");
  });

  it("returns null outside a FormField", () => {
    let seen: ReturnType<typeof useFormField> = { id: "sentinel", describedBy: undefined, invalid: false, required: false };
    const Probe = () => {
      seen = useFormField();
      return null;
    };
    render(<Probe />);
    expect(seen).toBeNull();
  });
});
