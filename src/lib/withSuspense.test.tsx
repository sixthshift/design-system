/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { withSuspense } from "./withSuspense";

type GreetingProps = {
  name: string;
};

function Greeting({ name }: GreetingProps) {
  return <div data-testid="greeting">Hello, {name}!</div>;
}

// A component that suspends until the caller resolves a controlled promise.
// This lets us drive Suspense deterministically instead of relying on real
// timers or arbitrary waits.
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

describe("withSuspense", () => {
  describe("rendering", () => {
    it("renders the wrapped component when it does not suspend", () => {
      const Wrapped = withSuspense(Greeting, "Loading...");
      render(<Wrapped name="Ada" />);

      expect(screen.getByTestId("greeting")).toHaveTextContent("Hello, Ada!");
    });

    it("forwards props to the wrapped component", () => {
      const Wrapped = withSuspense(Greeting, "Loading...");
      render(<Wrapped name="Grace" />);

      expect(screen.getByText("Hello, Grace!")).toBeInTheDocument();
    });
  });

  describe("suspense behavior", () => {
    it("shows the fallback while the wrapped component is pending", () => {
      const { Suspender } = createSuspender();
      const Wrapped = withSuspense(Suspender, "Loading...");

      render(<Wrapped name="Ada" />);

      expect(screen.getByText("Loading...")).toBeInTheDocument();
      expect(screen.queryByTestId("suspender-content")).not.toBeInTheDocument();
    });

    it("shows the wrapped component after the suspended promise resolves", async () => {
      const { Suspender, resolve } = createSuspender();
      const Wrapped = withSuspense(Suspender, "Loading...");

      render(<Wrapped name="Ada" />);
      expect(screen.getByText("Loading...")).toBeInTheDocument();

      resolve();

      expect(await screen.findByTestId("suspender-content")).toHaveTextContent("Loaded, Ada!");
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    it("accepts a ReactNode fallback", () => {
      const { Suspender } = createSuspender();
      const Wrapped = withSuspense(Suspender, <span data-testid="custom-fallback">Please wait</span>);

      render(<Wrapped name="Ada" />);

      expect(screen.getByTestId("custom-fallback")).toHaveTextContent("Please wait");
    });
  });

  describe("displayName", () => {
    it("sets displayName using the wrapped component's displayName", () => {
      function Named({ name }: GreetingProps) {
        return <div>{name}</div>;
      }
      Named.displayName = "CustomName";

      const Wrapped = withSuspense(Named, "Loading...");
      expect(Wrapped.displayName).toBe("withSuspense(CustomName)");
    });

    it("falls back to the function name when displayName is not set", () => {
      const Wrapped = withSuspense(Greeting, "Loading...");
      expect(Wrapped.displayName).toBe("withSuspense(Greeting)");
    });

    it('falls back to "Component" for anonymous components', () => {
      // Passed inline (no variable assignment) so the function has no inferred name.
      // Component.name is "" here, not undefined, so the `?? "Component"` fallback
      // in the implementation never kicks in for anonymous functions.
      const Wrapped = withSuspense((props: GreetingProps) => <div>{props.name}</div>, "Loading...");
      expect(Wrapped.displayName).toBe("withSuspense(Component)");
    });
  });
});
