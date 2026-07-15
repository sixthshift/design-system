/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Breadcrumb } from "./Breadcrumb";

describe("Breadcrumb", () => {
  describe("rendering", () => {
    it("renders as a nav element", () => {
      render(<Breadcrumb items={[{ label: "Home" }]} />);
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("has aria-label for accessibility", () => {
      render(<Breadcrumb items={[{ label: "Home" }]} />);
      expect(screen.getByRole("navigation")).toHaveAttribute("aria-label", "breadcrumb");
    });

    it("forwards ref to the nav element", () => {
      const ref = vi.fn();
      render(<Breadcrumb ref={ref} items={[{ label: "Home" }]} />);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
    });

    it("returns null when items array is empty", () => {
      const { container } = render(<Breadcrumb items={[]} />);
      expect(container).toBeEmptyDOMElement();
    });

    it("merges custom className", () => {
      render(<Breadcrumb items={[{ label: "Home" }]} className="custom-class" />);
      expect(screen.getByRole("navigation")).toHaveClass("custom-class");
    });
  });

  describe("items", () => {
    it("renders a single item", () => {
      render(<Breadcrumb items={[{ label: "Home" }]} />);
      expect(screen.getByText("Home")).toBeInTheDocument();
    });

    it("renders multiple items", () => {
      render(<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: "Widget" }]} />);
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Products")).toBeInTheDocument();
      expect(screen.getByText("Widget")).toBeInTheDocument();
    });

    it("renders links for non-last items with href", () => {
      render(<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: "Widget" }]} />);
      const homeLink = screen.getByRole("link", { name: "Home" });
      const productsLink = screen.getByRole("link", { name: "Products" });

      expect(homeLink).toHaveAttribute("href", "/");
      expect(productsLink).toHaveAttribute("href", "/products");
    });

    it("renders last item as span, not link", () => {
      render(
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Widget", href: "/widget" },
          ]}
        />
      );
      // Last item should not be a link even if href is provided
      expect(screen.queryByRole("link", { name: "Widget" })).toBeNull();
      expect(screen.getByText("Widget")).toBeInTheDocument();
    });

    it("marks last item with aria-current='page'", () => {
      render(<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Current Page" }]} />);
      expect(screen.getByText("Current Page")).toHaveAttribute("aria-current", "page");
    });

    it("applies font-medium to last item", () => {
      render(<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Last" }]} />);
      expect(screen.getByText("Last")).toHaveClass("font-medium");
    });
  });

  describe("separators", () => {
    it("renders separators between items", () => {
      render(<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: "Widget" }]} />);
      // ChevronRight icons should be present (aria-hidden)
      const separators = document.querySelectorAll('[aria-hidden="true"]');
      expect(separators.length).toBe(2);
    });

    it("does not render separator after last item", () => {
      render(<Breadcrumb items={[{ label: "Only Item" }]} />);
      const separators = document.querySelectorAll('[aria-hidden="true"]');
      expect(separators.length).toBe(0);
    });
  });

  describe("ReactNode labels", () => {
    it("accepts ReactNode as label", () => {
      render(
        <Breadcrumb
          items={[
            {
              label: <span data-testid="custom-label">Custom</span>,
              href: "/",
            },
            { label: "Last" },
          ]}
        />
      );
      expect(screen.getByTestId("custom-label")).toBeInTheDocument();
    });
  });
});
