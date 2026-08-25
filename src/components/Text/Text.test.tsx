/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Text } from "./Text";

describe("Text", () => {
  describe("rendering", () => {
    it("renders as span by default", () => {
      render(<Text data-testid="text">Hello</Text>);
      expect(screen.getByTestId("text").tagName).toBe("SPAN");
    });

    it("renders children", () => {
      render(<Text>Hello World</Text>);
      expect(screen.getByText("Hello World")).toBeInTheDocument();
    });

    it("forwards ref", () => {
      const ref = vi.fn();
      render(<Text ref={ref}>Hello</Text>);
      expect(ref).toHaveBeenCalled();
    });

    it("spreads additional props", () => {
      render(
        <Text data-testid="text" aria-label="greeting">
          Hello
        </Text>
      );
      expect(screen.getByTestId("text")).toHaveAttribute("aria-label", "greeting");
    });
  });

  describe("as prop (polymorphism)", () => {
    it("renders as span", () => {
      render(
        <Text as="span" data-testid="text">
          Span
        </Text>
      );
      expect(screen.getByTestId("text").tagName).toBe("SPAN");
    });

    it("renders as p", () => {
      render(
        <Text as="p" data-testid="text">
          Paragraph
        </Text>
      );
      expect(screen.getByTestId("text").tagName).toBe("P");
    });

    it("renders as div", () => {
      render(
        <Text as="div" data-testid="text">
          Div
        </Text>
      );
      expect(screen.getByTestId("text").tagName).toBe("DIV");
    });

    it("renders as label", () => {
      render(
        <Text as="label" data-testid="text">
          Label
        </Text>
      );
      expect(screen.getByTestId("text").tagName).toBe("LABEL");
    });

    it("renders as code", () => {
      render(
        <Text as="code" data-testid="text">
          code
        </Text>
      );
      expect(screen.getByTestId("text").tagName).toBe("CODE");
    });

    it("renders as h1", () => {
      render(
        <Text as="h1" data-testid="text">
          Heading 1
        </Text>
      );
      expect(screen.getByTestId("text").tagName).toBe("H1");
    });

    it("renders as h2", () => {
      render(
        <Text as="h2" data-testid="text">
          Heading 2
        </Text>
      );
      expect(screen.getByTestId("text").tagName).toBe("H2");
    });

    it("renders as h3", () => {
      render(
        <Text as="h3" data-testid="text">
          Heading 3
        </Text>
      );
      expect(screen.getByTestId("text").tagName).toBe("H3");
    });

    it("renders as h4", () => {
      render(
        <Text as="h4" data-testid="text">
          Heading 4
        </Text>
      );
      expect(screen.getByTestId("text").tagName).toBe("H4");
    });

    it("renders as h5", () => {
      render(
        <Text as="h5" data-testid="text">
          Heading 5
        </Text>
      );
      expect(screen.getByTestId("text").tagName).toBe("H5");
    });

    it("renders as h6", () => {
      render(
        <Text as="h6" data-testid="text">
          Heading 6
        </Text>
      );
      expect(screen.getByTestId("text").tagName).toBe("H6");
    });
  });

  describe("styling", () => {
    it("applies custom className", () => {
      render(
        <Text data-testid="text" className="font-bold text-lg">
          Styled
        </Text>
      );
      const text = screen.getByTestId("text");
      expect(text).toHaveClass("text-lg");
      expect(text).toHaveClass("font-bold");
    });

    it("accepts multiple classes", () => {
      render(
        <Text data-testid="text" className="text-fg-subtle text-sm leading-relaxed">
          Small text
        </Text>
      );
      const text = screen.getByTestId("text");
      expect(text).toHaveClass("text-sm");
      expect(text).toHaveClass("leading-relaxed");
    });
  });
});
