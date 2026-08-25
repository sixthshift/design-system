/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { ComponentsProvider, useComponents } from "./ComponentsContext";

type LinkProps = {
  href: string;
  className?: string;
  title?: string;
  children: ReactNode;
};

const CustomLink = ({ href, children, ...props }: LinkProps) => (
  <a href={href} data-testid="custom-link" {...props}>
    {children}
  </a>
);

const Consumer = () => {
  const { Link } = useComponents();
  return <Link href="/somewhere">Go</Link>;
};

describe("useComponents", () => {
  describe("without a provider", () => {
    it("returns the default Link component, rendered as an anchor", () => {
      render(<Consumer />);
      const link = screen.getByText("Go");
      expect(link.tagName).toBe("A");
      expect(link).toHaveAttribute("href", "/somewhere");
    });

    it("does not throw when used outside of a ComponentsProvider", () => {
      expect(() => render(<Consumer />)).not.toThrow();
    });
  });

  describe("with a ComponentsProvider", () => {
    it("uses the overridden Link component", () => {
      render(
        <ComponentsProvider components={{ Link: CustomLink }}>
          <Consumer />
        </ComponentsProvider>
      );
      expect(screen.getByTestId("custom-link")).toBeInTheDocument();
      expect(screen.getByText("Go")).toHaveAttribute("href", "/somewhere");
    });

    it("falls back to the default Link when components is an empty object", () => {
      render(
        <ComponentsProvider components={{}}>
          <Consumer />
        </ComponentsProvider>
      );
      expect(screen.queryByTestId("custom-link")).not.toBeInTheDocument();
      expect(screen.getByText("Go").tagName).toBe("A");
    });

    it("passes through extra props (className, title) given to the override", () => {
      render(
        <ComponentsProvider components={{ Link: CustomLink }}>
          <CustomLink href="/x" className="link-class" title="A link">
            Text
          </CustomLink>
        </ComponentsProvider>
      );
      const link = screen.getByText("Text");
      expect(link).toHaveClass("link-class");
      expect(link).toHaveAttribute("title", "A link");
    });
  });

  describe("nesting", () => {
    it("lets an inner provider override the outer provider's override", () => {
      const InnerLink = ({ href, children, ...props }: LinkProps) => (
        <a href={href} data-testid="inner-link" {...props}>
          {children}
        </a>
      );

      render(
        <ComponentsProvider components={{ Link: CustomLink }}>
          <ComponentsProvider components={{ Link: InnerLink }}>
            <Consumer />
          </ComponentsProvider>
        </ComponentsProvider>
      );

      expect(screen.getByTestId("inner-link")).toBeInTheDocument();
      expect(screen.queryByTestId("custom-link")).not.toBeInTheDocument();
    });

    it("an inner provider without its own override resets to the default Link, rather than inheriting the outer override", () => {
      render(
        <ComponentsProvider components={{ Link: CustomLink }}>
          <ComponentsProvider components={{}}>
            <Consumer />
          </ComponentsProvider>
        </ComponentsProvider>
      );

      // Each provider merges against the module-level defaults, not against
      // the parent context value, so the inner provider's plain <a> wins here.
      expect(screen.queryByTestId("custom-link")).not.toBeInTheDocument();
      expect(screen.getByText("Go").tagName).toBe("A");
    });
  });
});
