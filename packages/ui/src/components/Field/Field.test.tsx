/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Field } from "./Field";

describe("Field", () => {
  describe("rendering", () => {
    it("renders the label and value", () => {
      render(<Field label="WhatsApp">61400000001@s.whatsapp.net</Field>);
      expect(screen.getByText("WhatsApp")).toBeInTheDocument();
      expect(screen.getByText("61400000001@s.whatsapp.net")).toBeInTheDocument();
    });

    it("renders the value as a ReactNode (not coerced to string)", () => {
      render(
        <Field label="Phone">
          <a href="tel:+61400000001">+61 400 000 001</a>
        </Field>
      );
      expect(screen.getByRole("link", { name: "+61 400 000 001" })).toBeInTheDocument();
    });
  });

  describe("identifier defaults", () => {
    it("renders the value in monospace by default because identifiers are the canonical case", () => {
      render(<Field label="WhatsApp">61400000001@s.whatsapp.net</Field>);
      expect(screen.getByText("61400000001@s.whatsapp.net")).toHaveClass("font-mono");
    });

    it("breaks long identifiers so they wrap inside the row", () => {
      render(<Field label="OAuth">abcdef1234567890.apps.googleusercontent.com</Field>);
      expect(screen.getByText("abcdef1234567890.apps.googleusercontent.com")).toHaveClass("break-all");
    });
  });

  describe("proportional value (mono=false)", () => {
    it("does not apply monospace when mono is false", () => {
      render(
        <Field label="Display name" mono={false}>
          Mom
        </Field>
      );
      expect(screen.getByText("Mom")).not.toHaveClass("font-mono");
    });

    it("does not apply break-all when mono is false", () => {
      render(
        <Field label="Display name" mono={false}>
          Mom
        </Field>
      );
      expect(screen.getByText("Mom")).not.toHaveClass("break-all");
    });
  });

  describe("layout=stacked (default)", () => {
    it("uses an uppercase tracked label so it reads as a section heading", () => {
      render(<Field label="WhatsApp">jid</Field>);
      expect(screen.getByText("WhatsApp")).toHaveClass("uppercase");
    });
  });

  describe("layout=row", () => {
    it("renders the label and value side by side", () => {
      render(
        <Field label="Phone" layout="row" mono={false}>
          +61 400 000 001
        </Field>
      );
      // The label is no longer uppercase in row layout — it sits inline.
      expect(screen.getByText("Phone")).not.toHaveClass("uppercase");
    });

    it("right-aligns the value so it lines up against the row edge", () => {
      render(
        <Field label="Phone" layout="row" mono={false}>
          +61 400 000 001
        </Field>
      );
      expect(screen.getByText("+61 400 000 001")).toHaveClass("text-right");
    });
  });

  describe("className merging", () => {
    it("merges a custom className onto the outer wrapper", () => {
      const { container } = render(
        <Field label="WhatsApp" className="custom-class">
          jid
        </Field>
      );
      expect(container.firstChild).toHaveClass("custom-class");
    });
  });
});
