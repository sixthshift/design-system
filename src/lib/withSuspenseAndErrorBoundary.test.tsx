/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ErrorFallbackProps } from "./ErrorBoundary";
import { withSuspenseAndErrorBoundary } from "./withSuspenseAndErrorBoundary";

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

function createSuspender() {
  let resolvePromise!: () => void;
  const promise = new Promise<void>((resolve) => {
    resolvePromise = resolve;
  });

  let status: "pending" | "resolved" = "pending";
  const tracked = promise.then(() => {
    status = "resolved";
  });

  function Suspender({ name }: GreetingProps) {
    if (status === "pending") {
      throw tracked;
    }
    return <div data-testid="suspender-content">Loaded, {name}!</div>;
  }

  return { Suspender, resolve: resolvePromise };
}

describe("withSuspenseAndErrorBoundary", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("rendering", () => {
    it("renders the wrapped component when it neither suspends nor throws", () => {
      const Wrapped = withSuspenseAndErrorBoundary(Greeting, {
        fallback: "Loading...",
        errorFallback: "Something went wrong",
      });

      render(<Wrapped name="Ada" />);

      expect(screen.getByTestId("greeting")).toHaveTextContent("Hello, Ada!");
    });

    it("forwards props to the wrapped component", () => {
      const Wrapped = withSuspenseAndErrorBoundary(Greeting, {
        fallback: "Loading...",
        errorFallback: "Something went wrong",
      });

      render(<Wrapped name="Grace" />);

      expect(screen.getByText("Hello, Grace!")).toBeInTheDocument();
    });
  });

  describe("suspense behavior", () => {
    it("shows the loading fallback while the wrapped component is pending", () => {
      const { Suspender } = createSuspender();
      const Wrapped = withSuspenseAndErrorBoundary(Suspender, {
        fallback: "Loading...",
        errorFallback: "Something went wrong",
      });

      render(<Wrapped name="Ada" />);

      expect(screen.getByText("Loading...")).toBeInTheDocument();
      expect(screen.queryByTestId("suspender-content")).not.toBeInTheDocument();
    });

    it("shows the wrapped component after the suspended promise resolves", async () => {
      const { Suspender, resolve } = createSuspender();
      const Wrapped = withSuspenseAndErrorBoundary(Suspender, {
        fallback: "Loading...",
        errorFallback: "Something went wrong",
      });

      render(<Wrapped name="Ada" />);
      expect(screen.getByText("Loading...")).toBeInTheDocument();

      resolve();

      expect(await screen.findByTestId("suspender-content")).toHaveTextContent("Loaded, Ada!");
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });
  });

  describe("error boundary behavior", () => {
    it("shows the error fallback when the wrapped component throws", () => {
      const Wrapped = withSuspenseAndErrorBoundary(Thrower, {
        fallback: "Loading...",
        errorFallback: "Something went wrong",
      });

      render(<Wrapped shouldThrow name="Ada" />);

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      expect(screen.queryByTestId("thrower-content")).not.toBeInTheDocument();
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    it("supports a function errorFallback that receives the error", () => {
      const errorFallback = (props: ErrorFallbackProps) => <div data-testid="error-fallback">{props.error.message}</div>;
      const Wrapped = withSuspenseAndErrorBoundary(Thrower, {
        fallback: "Loading...",
        errorFallback,
      });

      render(<Wrapped shouldThrow name="Ada" />);

      expect(screen.getByTestId("error-fallback")).toHaveTextContent("boom: Ada");
    });

    it("does not trigger the error boundary while merely suspending", () => {
      const { Suspender } = createSuspender();
      const Wrapped = withSuspenseAndErrorBoundary(Suspender, {
        fallback: "Loading...",
        errorFallback: "Something went wrong",
      });

      render(<Wrapped name="Ada" />);

      expect(screen.getByText("Loading...")).toBeInTheDocument();
      expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
    });
  });

  describe("displayName", () => {
    it("sets displayName using the wrapped component's displayName", () => {
      function Named({ name }: GreetingProps) {
        return <div>{name}</div>;
      }
      Named.displayName = "CustomName";

      const Wrapped = withSuspenseAndErrorBoundary(Named, {
        fallback: "Loading...",
        errorFallback: "Something went wrong",
      });
      expect(Wrapped.displayName).toBe("withSuspenseAndErrorBoundary(CustomName)");
    });

    it("falls back to the function name when displayName is not set", () => {
      const Wrapped = withSuspenseAndErrorBoundary(Greeting, {
        fallback: "Loading...",
        errorFallback: "Something went wrong",
      });
      expect(Wrapped.displayName).toBe("withSuspenseAndErrorBoundary(Greeting)");
    });
  });
});
