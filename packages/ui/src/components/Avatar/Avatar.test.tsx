/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";

describe("Avatar", () => {
  describe("rendering", () => {
    it("renders as a span element", () => {
      render(<Avatar data-testid="avatar" />);
      expect(screen.getByTestId("avatar").tagName).toBe("SPAN");
    });

    it("forwards ref to the span element", () => {
      const ref = vi.fn();
      render(<Avatar ref={ref} />);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLSpanElement));
    });

    it("spreads additional props", () => {
      render(<Avatar data-testid="avatar" aria-label="User avatar" />);
      expect(screen.getByTestId("avatar")).toHaveAttribute("aria-label", "User avatar");
    });

    it("applies default classes", () => {
      render(<Avatar data-testid="avatar" />);
      const avatar = screen.getByTestId("avatar");
      expect(avatar).toHaveClass("relative");
      expect(avatar).toHaveClass("flex");
      expect(avatar).toHaveClass("h-10");
      expect(avatar).toHaveClass("w-10");
      expect(avatar).toHaveClass("rounded-full");
      expect(avatar).toHaveClass("overflow-hidden");
    });

    it("merges custom className", () => {
      render(<Avatar data-testid="avatar" className="custom-class" />);
      const avatar = screen.getByTestId("avatar");
      expect(avatar).toHaveClass("custom-class");
      expect(avatar).toHaveClass("rounded-full");
    });
  });
});

describe("AvatarImage", () => {
  it("renders as an img element", () => {
    render(<AvatarImage src="/test.jpg" alt="Test" />);
    expect(screen.getByRole("img")).toBeInstanceOf(HTMLImageElement);
  });

  it("forwards ref to the img element", () => {
    const ref = vi.fn();
    render(<AvatarImage ref={ref} src="/test.jpg" alt="Test" />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLImageElement));
  });

  it("applies src and alt attributes", () => {
    render(<AvatarImage src="/test.jpg" alt="User photo" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/test.jpg");
    expect(img).toHaveAttribute("alt", "User photo");
  });

  it("applies default classes", () => {
    render(<AvatarImage src="/test.jpg" alt="Test" />);
    const img = screen.getByRole("img");
    expect(img).toHaveClass("aspect-square");
    expect(img).toHaveClass("h-full");
    expect(img).toHaveClass("w-full");
  });

  it("merges custom className", () => {
    render(<AvatarImage src="/test.jpg" alt="Test" className="custom-class" />);
    const img = screen.getByRole("img");
    expect(img).toHaveClass("custom-class");
    expect(img).toHaveClass("aspect-square");
  });
});

describe("AvatarFallback", () => {
  it("renders as a span element", () => {
    render(<AvatarFallback data-testid="fallback">JD</AvatarFallback>);
    expect(screen.getByTestId("fallback").tagName).toBe("SPAN");
  });

  it("renders children", () => {
    render(<AvatarFallback>JD</AvatarFallback>);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("forwards ref to the span element", () => {
    const ref = vi.fn();
    render(<AvatarFallback ref={ref}>JD</AvatarFallback>);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLSpanElement));
  });

  it("applies default classes", () => {
    render(<AvatarFallback data-testid="fallback">JD</AvatarFallback>);
    const fallback = screen.getByTestId("fallback");
    expect(fallback).toHaveClass("flex");
    expect(fallback).toHaveClass("h-full");
    expect(fallback).toHaveClass("w-full");
    expect(fallback).toHaveClass("items-center");
    expect(fallback).toHaveClass("justify-center");
    expect(fallback).toHaveClass("rounded-full");
  });

  it("merges custom className", () => {
    render(
      <AvatarFallback data-testid="fallback" className="custom-class">
        JD
      </AvatarFallback>
    );
    const fallback = screen.getByTestId("fallback");
    expect(fallback).toHaveClass("custom-class");
    expect(fallback).toHaveClass("rounded-full");
  });
});

describe("Avatar composition", () => {
  it("renders with image and fallback", () => {
    render(
      <Avatar data-testid="avatar">
        <AvatarImage src="/test.jpg" alt="User" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByTestId("avatar")).toBeInTheDocument();
    expect(screen.getByRole("img")).toBeInTheDocument();
    expect(screen.getByText("JD")).toBeInTheDocument();
  });
});
