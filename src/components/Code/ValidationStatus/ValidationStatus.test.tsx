/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ValidationError } from "./ValidationStatus";
import { ValidationStatus } from "./ValidationStatus";

const error = (overrides: Partial<ValidationError> = {}): ValidationError => ({
  line: 1,
  column: 1,
  message: "Something went wrong",
  severity: "error",
  ...overrides,
});

describe("ValidationStatus", () => {
  describe("no errors", () => {
    it("renders a success message when there are no errors", () => {
      render(<ValidationStatus errors={[]} />);
      expect(screen.getByText("No errors — code is valid")).toBeInTheDocument();
      expect(screen.getByRole("alert")).toHaveClass("bg-bg-success-subtle");
    });

    it("does not render any per-error rows when there are no errors", () => {
      render(<ValidationStatus errors={[]} />);
      expect(screen.getAllByRole("alert")).toHaveLength(1);
    });
  });

  describe("with errors", () => {
    it("renders a danger summary message", () => {
      render(<ValidationStatus errors={[error()]} />);
      const alerts = screen.getAllByRole("alert");
      expect(alerts[0]).toHaveClass("bg-bg-danger-subtle");
    });

    it("summarises a single error", () => {
      render(<ValidationStatus errors={[error()]} />);
      expect(screen.getByText("1 error")).toBeInTheDocument();
    });

    it("pluralises multiple errors in the summary", () => {
      render(<ValidationStatus errors={[error(), error({ line: 2 })]} />);
      expect(screen.getByText("2 errors")).toBeInTheDocument();
    });

    it("includes warning counts alongside error counts in the summary", () => {
      render(<ValidationStatus errors={[error(), error({ severity: "warning", line: 2 })]} />);
      expect(screen.getByText("1 error, 1 warning")).toBeInTheDocument();
    });

    it("pluralises warnings in the summary", () => {
      render(<ValidationStatus errors={[error({ severity: "warning" }), error({ severity: "warning", line: 2 })]} />);
      expect(screen.getByText("2 warnings")).toBeInTheDocument();
    });

    it("omits the error count from the summary when there are only warnings", () => {
      render(<ValidationStatus errors={[error({ severity: "warning" })]} />);
      expect(screen.getByText("1 warning")).toBeInTheDocument();
    });

    it("renders a row per error with its line and column", () => {
      render(<ValidationStatus errors={[error({ line: 5, column: 12, message: "Type error" })]} />);
      expect(screen.getByText("Type error")).toBeInTheDocument();
      expect(screen.getByText("Line 5, Column 12")).toBeInTheDocument();
    });

    it("renders a row for each distinct error", () => {
      render(
        <ValidationStatus
          errors={[error({ line: 1, message: "First issue" }), error({ line: 2, message: "Second issue" }), error({ line: 3, message: "Third issue" })]}
        />
      );
      expect(screen.getByText("First issue")).toBeInTheDocument();
      expect(screen.getByText("Second issue")).toBeInTheDocument();
      expect(screen.getByText("Third issue")).toBeInTheDocument();
    });

    it("applies the correct intent styling per severity", () => {
      render(
        <ValidationStatus
          errors={[
            error({ line: 1, message: "err", severity: "error" }),
            error({ line: 2, message: "warn", severity: "warning" }),
            error({ line: 3, message: "info", severity: "info" }),
          ]}
        />
      );
      const alerts = screen.getAllByRole("alert");
      // alerts[0] is the summary message; the per-row messages follow in order
      expect(alerts[1]).toHaveClass("bg-bg-danger-subtle");
      expect(alerts[2]).toHaveClass("bg-bg-warning-subtle");
      expect(alerts[3]).toHaveClass("bg-bg-normal");
    });
  });

  describe("maxRows", () => {
    const manyErrors = Array.from({ length: 7 }, (_, i) => error({ line: i + 1, message: `Issue ${i + 1}` }));

    it("caps the number of rendered rows at the default of 5", () => {
      render(<ValidationStatus errors={manyErrors} />);
      expect(screen.getByText("Issue 1")).toBeInTheDocument();
      expect(screen.getByText("Issue 5")).toBeInTheDocument();
      expect(screen.queryByText("Issue 6")).not.toBeInTheDocument();
    });

    it("summarises the remaining rows as overflow", () => {
      render(<ValidationStatus errors={manyErrors} />);
      expect(screen.getByText("…and 2 more")).toBeInTheDocument();
    });

    it("respects a custom maxRows value", () => {
      render(<ValidationStatus errors={manyErrors} maxRows={2} />);
      expect(screen.getByText("Issue 1")).toBeInTheDocument();
      expect(screen.getByText("Issue 2")).toBeInTheDocument();
      expect(screen.queryByText("Issue 3")).not.toBeInTheDocument();
      expect(screen.getByText("…and 5 more")).toBeInTheDocument();
    });

    it("does not show an overflow message when errors fit within maxRows", () => {
      render(<ValidationStatus errors={[error()]} maxRows={5} />);
      expect(screen.queryByText(/…and/)).not.toBeInTheDocument();
    });
  });

  describe("className merging", () => {
    it("merges custom className onto the wrapper", () => {
      const { container } = render(<ValidationStatus errors={[]} className="custom-class" />);
      expect(container.firstElementChild).toHaveClass("custom-class");
    });

    it("spreads additional props onto the wrapper", () => {
      render(<ValidationStatus errors={[]} data-testid="validation-status" />);
      expect(screen.getByTestId("validation-status")).toBeInTheDocument();
    });
  });
});
