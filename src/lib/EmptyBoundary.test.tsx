/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyBoundary } from "./EmptyBoundary";

describe("EmptyBoundary", () => {
  describe("rendering", () => {
    it("renders children when isEmpty is false", () => {
      render(
        <EmptyBoundary isEmpty={false} fallback={<div>No data</div>}>
          <div>Content</div>
        </EmptyBoundary>
      );

      expect(screen.getByText("Content")).toBeInTheDocument();
      expect(screen.queryByText("No data")).not.toBeInTheDocument();
    });

    it("renders fallback when isEmpty is true", () => {
      render(
        <EmptyBoundary isEmpty fallback={<div>No data</div>}>
          <div>Content</div>
        </EmptyBoundary>
      );

      expect(screen.getByText("No data")).toBeInTheDocument();
      expect(screen.queryByText("Content")).not.toBeInTheDocument();
    });
  });

  describe("switching state", () => {
    it("switches from fallback to children when isEmpty changes to false", () => {
      const { rerender } = render(
        <EmptyBoundary isEmpty fallback={<div>No data</div>}>
          <div>Content</div>
        </EmptyBoundary>
      );

      expect(screen.getByText("No data")).toBeInTheDocument();

      rerender(
        <EmptyBoundary isEmpty={false} fallback={<div>No data</div>}>
          <div>Content</div>
        </EmptyBoundary>
      );

      expect(screen.getByText("Content")).toBeInTheDocument();
      expect(screen.queryByText("No data")).not.toBeInTheDocument();
    });

    it("switches from children to fallback when isEmpty changes to true", () => {
      const { rerender } = render(
        <EmptyBoundary isEmpty={false} fallback={<div>No data</div>}>
          <div>Content</div>
        </EmptyBoundary>
      );

      expect(screen.getByText("Content")).toBeInTheDocument();

      rerender(
        <EmptyBoundary isEmpty fallback={<div>No data</div>}>
          <div>Content</div>
        </EmptyBoundary>
      );

      expect(screen.getByText("No data")).toBeInTheDocument();
      expect(screen.queryByText("Content")).not.toBeInTheDocument();
    });
  });
});
