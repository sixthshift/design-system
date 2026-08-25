/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { withEmpty } from "./withEmpty";

type ListProps = {
  items: string[];
};

function List({ items }: ListProps) {
  return (
    <ul data-testid="list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

describe("withEmpty", () => {
  describe("rendering", () => {
    it("renders the wrapped component when isEmpty returns false", () => {
      const Wrapped = withEmpty(List, (props: ListProps) => props.items.length === 0, "No items");
      render(<Wrapped items={["a", "b"]} />);

      expect(screen.getByTestId("list")).toBeInTheDocument();
      expect(screen.getByText("a")).toBeInTheDocument();
      expect(screen.queryByText("No items")).not.toBeInTheDocument();
    });

    it("renders the fallback when isEmpty returns true", () => {
      const Wrapped = withEmpty(List, (props: ListProps) => props.items.length === 0, "No items");
      render(<Wrapped items={[]} />);

      expect(screen.getByText("No items")).toBeInTheDocument();
      expect(screen.queryByTestId("list")).not.toBeInTheDocument();
    });

    it("forwards props to the wrapped component when not empty", () => {
      const Wrapped = withEmpty(List, (props: ListProps) => props.items.length === 0, "No items");
      render(<Wrapped items={["x", "y", "z"]} />);

      expect(screen.getByText("x")).toBeInTheDocument();
      expect(screen.getByText("y")).toBeInTheDocument();
      expect(screen.getByText("z")).toBeInTheDocument();
    });

    it("accepts a ReactNode fallback", () => {
      const Wrapped = withEmpty(List, (props: ListProps) => props.items.length === 0, <span data-testid="empty-state">Nothing here</span>);
      render(<Wrapped items={[]} />);

      expect(screen.getByTestId("empty-state")).toHaveTextContent("Nothing here");
    });
  });

  describe("isEmpty predicate", () => {
    it("calls isEmpty with the full props object", () => {
      const isEmpty = vi.fn((props: ListProps) => props.items.length === 0);
      const Wrapped = withEmpty(List, isEmpty, "No items");

      render(<Wrapped items={["a"]} />);

      expect(isEmpty).toHaveBeenCalledWith({ items: ["a"] });
    });

    it("treats an empty array as empty when the predicate checks length", () => {
      const Wrapped = withEmpty(List, (props: ListProps) => props.items.length === 0, "No items");
      render(<Wrapped items={[]} />);

      expect(screen.getByText("No items")).toBeInTheDocument();
    });

    it("treats a single-item array as non-empty when the predicate checks length", () => {
      const Wrapped = withEmpty(List, (props: ListProps) => props.items.length === 0, "No items");
      render(<Wrapped items={["only"]} />);

      expect(screen.getByText("only")).toBeInTheDocument();
    });

    it("supports predicates based on a string prop, treating an empty string as empty", () => {
      type TextProps = { text: string };
      function Text({ text }: TextProps) {
        return <p data-testid="text">{text}</p>;
      }
      const Wrapped = withEmpty(Text, (props: TextProps) => props.text === "", "No text");

      render(<Wrapped text="" />);
      expect(screen.getByText("No text")).toBeInTheDocument();
    });

    it("supports predicates based on null/undefined props", () => {
      type MaybeProps = { value: string | null | undefined };
      function Value({ value }: MaybeProps) {
        return <p data-testid="value">{value}</p>;
      }
      const Wrapped = withEmpty(Value, (props: MaybeProps) => props.value == null, "No value");

      render(<Wrapped value={undefined} />);
      expect(screen.getByText("No value")).toBeInTheDocument();
    });

    it("re-evaluates isEmpty on every render as props change", () => {
      const Wrapped = withEmpty(List, (props: ListProps) => props.items.length === 0, "No items");

      const { rerender } = render(<Wrapped items={[]} />);
      expect(screen.getByText("No items")).toBeInTheDocument();

      rerender(<Wrapped items={["a"]} />);
      expect(screen.getByText("a")).toBeInTheDocument();
      expect(screen.queryByText("No items")).not.toBeInTheDocument();
    });
  });

  describe("displayName", () => {
    it("sets displayName using the wrapped component's displayName", () => {
      function Named({ items }: ListProps) {
        return <ul>{items}</ul>;
      }
      Named.displayName = "CustomName";

      const Wrapped = withEmpty(Named, (props: ListProps) => props.items.length === 0, "No items");
      expect(Wrapped.displayName).toBe("withEmpty(CustomName)");
    });

    it("falls back to the function name when displayName is not set", () => {
      const Wrapped = withEmpty(List, (props: ListProps) => props.items.length === 0, "No items");
      expect(Wrapped.displayName).toBe("withEmpty(List)");
    });
  });
});
