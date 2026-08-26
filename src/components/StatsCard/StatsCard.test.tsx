/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { StatsCard } from "./StatsCard";

describe("StatsCard", () => {
  describe("rendering", () => {
    it("renders title, description and children", () => {
      render(
        <StatsCard title="database" description="Tables and queries">
          <span>1,247</span>
        </StatsCard>
      );
      expect(screen.getByText("database")).toBeInTheDocument();
      expect(screen.getByText("Tables and queries")).toBeInTheDocument();
      expect(screen.getByText("1,247")).toBeInTheDocument();
    });

    it("forwards ref", () => {
      const ref = vi.fn();
      render(
        <StatsCard title="t" description="d" ref={ref}>
          content
        </StatsCard>
      );
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    });

    it("renders as a div", () => {
      const { container } = render(
        <StatsCard title="t" description="d">
          content
        </StatsCard>
      );
      expect((container.firstChild as HTMLElement).tagName).toBe("DIV");
    });
  });

  describe("icon slot", () => {
    it("renders the icon when provided", () => {
      render(
        <StatsCard title="database" description="Tables and queries" icon={<svg data-testid="icon" />}>
          content
        </StatsCard>
      );
      expect(screen.getByTestId("icon")).toBeInTheDocument();
    });

    it("does not render an icon wrapper when icon is not provided", () => {
      const { container } = render(
        <StatsCard title="database" description="Tables and queries">
          content
        </StatsCard>
      );
      expect(container.querySelector("svg")).not.toBeInTheDocument();
    });
  });

  describe("status", () => {
    it.each([
      ["healthy", "border-l-green-500"],
      ["warning", "border-l-amber-500"],
      ["error", "border-l-red-500"],
      ["neutral", "border-l-border-subtle"],
    ] as const)("applies the %s status border class", (status, expectedClass) => {
      const { container } = render(
        <StatsCard title="t" description="d" status={status}>
          content
        </StatsCard>
      );
      expect(container.firstChild as HTMLElement).toHaveClass(expectedClass);
    });

    it("defaults to the neutral status when not specified", () => {
      const { container } = render(
        <StatsCard title="t" description="d">
          content
        </StatsCard>
      );
      expect(container.firstChild as HTMLElement).toHaveClass("border-l-border-subtle");
    });
  });

  describe("edge cases", () => {
    it("renders a long title and description that would wrap", () => {
      const longTitle = "a very long stats card title that describes an extremely specific subsystem in great detail";
      const longDescription = "an equally long description that explains exactly what this metric represents and how it is computed over time";
      render(
        <StatsCard title={longTitle} description={longDescription}>
          content
        </StatsCard>
      );
      expect(screen.getByText(longTitle)).toBeInTheDocument();
      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    it("renders complex children content", () => {
      render(
        <StatsCard title="events" description="Event stream">
          <div>
            <span data-testid="count">1,842</span>
            <span>last 24h</span>
          </div>
        </StatsCard>
      );
      expect(screen.getByTestId("count")).toBeInTheDocument();
      expect(screen.getByText("last 24h")).toBeInTheDocument();
    });
  });

  describe("base styles", () => {
    it("has flex-col layout and a left border", () => {
      const { container } = render(
        <StatsCard title="t" description="d">
          content
        </StatsCard>
      );
      const root = container.firstChild as HTMLElement;
      expect(root).toHaveClass("flex");
      expect(root).toHaveClass("flex-col");
      expect(root).toHaveClass("border-l-2");
    });
  });

  describe("className merging", () => {
    it("merges custom className with default classes", () => {
      const { container } = render(
        <StatsCard title="t" description="d" className="custom-class">
          content
        </StatsCard>
      );
      const root = container.firstChild as HTMLElement;
      expect(root).toHaveClass("custom-class");
      expect(root).toHaveClass("flex");
    });
  });
});
