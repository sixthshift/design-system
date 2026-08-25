/// <reference types="@testing-library/jest-dom" />
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ErrorFallbackProps } from "./ErrorBoundary";
import { withErrorBoundary } from "./withErrorBoundary";

type GreetingProps = {
  name: string;
};

function Greeting({ name }: GreetingProps) {
  return <div data-testid="greeting">Hello, {name}!</div>;
}

type ThrowerProps = {
  shouldThrow: boolean;
  name: string;
};

function Thrower({ shouldThrow, name }: ThrowerProps) {
  if (shouldThrow) {
    throw new Error(`boom: ${name}`);
  }
  return <div data-testid="thrower-content">Safe, {name}!</div>;
}

describe("withErrorBoundary", () => {
  // React logs caught errors via console.error and componentDidCatch also
  // calls console.error directly; silence both for these tests.
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("rendering", () => {
    it("renders the wrapped component when it does not throw", () => {
      const Wrapped = withErrorBoundary(Greeting, "Something went wrong");
      render(<Wrapped name="Ada" />);

      expect(screen.getByTestId("greeting")).toHaveTextContent("Hello, Ada!");
    });

    it("forwards props to the wrapped component", () => {
      const Wrapped = withErrorBoundary(Thrower, "Something went wrong");
      render(<Wrapped shouldThrow={false} name="Grace" />);

      expect(screen.getByText("Safe, Grace!")).toBeInTheDocument();
    });
  });

  describe("error handling", () => {
    it("renders the fallback when the wrapped component throws", () => {
      const Wrapped = withErrorBoundary(Thrower, "Something went wrong");
      render(<Wrapped shouldThrow name="Ada" />);

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      expect(screen.queryByTestId("thrower-content")).not.toBeInTheDocument();
    });

    it("logs the caught error to console.error", () => {
      const Wrapped = withErrorBoundary(Thrower, "Something went wrong");
      render(<Wrapped shouldThrow name="Ada" />);

      expect(console.error).toHaveBeenCalled();
    });

    it("supports a function fallback that receives the error and a reset callback", () => {
      const fallback = (props: ErrorFallbackProps) => <div data-testid="error-fallback">{props.error.message}</div>;
      const Wrapped = withErrorBoundary(Thrower, fallback);

      render(<Wrapped shouldThrow name="Ada" />);

      expect(screen.getByTestId("error-fallback")).toHaveTextContent("boom: Ada");
    });

    it("passes a reset function that re-renders children when invoked", () => {
      const fallback = (props: ErrorFallbackProps) => (
        <button type="button" onClick={props.reset}>
          Reset
        </button>
      );
      const Wrapped = withErrorBoundary(Thrower, fallback);

      const { rerender } = render(<Wrapped shouldThrow name="Ada" />);
      expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();

      // Change props to no longer throw before resetting, then reset the boundary.
      rerender(<Wrapped shouldThrow={false} name="Ada" />);
      fireEvent.click(screen.getByRole("button", { name: "Reset" }));

      expect(screen.getByTestId("thrower-content")).toHaveTextContent("Safe, Ada!");
    });
  });

  describe("displayName", () => {
    it("sets displayName using the wrapped component's displayName", () => {
      function Named({ name }: GreetingProps) {
        return <div>{name}</div>;
      }
      Named.displayName = "CustomName";

      const Wrapped = withErrorBoundary(Named, "Something went wrong");
      expect(Wrapped.displayName).toBe("withErrorBoundary(CustomName)");
    });

    it("falls back to the function name when displayName is not set", () => {
      const Wrapped = withErrorBoundary(Greeting, "Something went wrong");
      expect(Wrapped.displayName).toBe("withErrorBoundary(Greeting)");
    });
  });
});
