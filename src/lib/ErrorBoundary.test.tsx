/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { ErrorBoundary } from "./ErrorBoundary";

function Bomb({ shouldThrow, message = "Boom" }: { shouldThrow: boolean; message?: string }) {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div>Safe content</div>;
}

describe("ErrorBoundary", () => {
  describe("rendering", () => {
    it("renders children when nothing throws", () => {
      render(
        <ErrorBoundary fallback={<div>Fallback</div>}>
          <div>Safe content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText("Safe content")).toBeInTheDocument();
      expect(screen.queryByText("Fallback")).not.toBeInTheDocument();
    });

    it("renders a node fallback when a child throws", () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

      render(
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <Bomb shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      expect(screen.queryByText("Safe content")).not.toBeInTheDocument();

      consoleError.mockRestore();
    });

    it("catches an error thrown after a previously successful render", () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

      const { rerender } = render(
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <Bomb shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText("Safe content")).toBeInTheDocument();

      rerender(
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <Bomb shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();

      consoleError.mockRestore();
    });
  });

  describe("function fallback", () => {
    it("invokes the fallback function with the caught error", () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

      render(
        <ErrorBoundary fallback={({ error }) => <div>Error: {error.message}</div>}>
          <Bomb shouldThrow message="Custom failure" />
        </ErrorBoundary>
      );

      expect(screen.getByText("Error: Custom failure")).toBeInTheDocument();

      consoleError.mockRestore();
    });

    it("provides a reset function that clears the caught error", async () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
      const user = userEvent.setup();

      function Harness() {
        const [shouldThrow, setShouldThrow] = useState(true);
        return (
          <ErrorBoundary
            fallback={({ reset }) => (
              <button
                type="button"
                onClick={() => {
                  setShouldThrow(false);
                  reset();
                }}
              >
                Retry
              </button>
            )}
          >
            <Bomb shouldThrow={shouldThrow} />
          </ErrorBoundary>
        );
      }

      render(<Harness />);

      expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Retry" }));

      expect(screen.getByText("Safe content")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();

      consoleError.mockRestore();
    });
  });

  describe("logging", () => {
    it("logs the caught error via console.error", () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

      render(
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <Bomb shouldThrow message="Logged failure" />
        </ErrorBoundary>
      );

      expect(consoleError).toHaveBeenCalledWith("ErrorBoundary caught:", expect.objectContaining({ message: "Logged failure" }), expect.anything());

      consoleError.mockRestore();
    });
  });
});
