/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FormField } from "./FormField";

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
