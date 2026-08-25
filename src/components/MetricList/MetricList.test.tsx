/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MetricList } from "./MetricList";
import { MetricRow } from "./MetricRow";

describe("MetricList", () => {
  describe("rendering", () => {
    it("renders as a div", () => {
      const { container } = render(<MetricList>Content</MetricList>);
      expect((container.firstChild as HTMLElement).tagName).toBe("DIV");
    });

    it("renders an empty list with no rows", () => {
      const { container } = render(<MetricList>{null}</MetricList>);
      const root = container.firstChild as HTMLElement;
      expect(root).toBeEmptyDOMElement();
    });

    it("renders a single row", () => {
      render(
        <MetricList>
          <MetricRow label="CPU Usage" value="12.5%" />
        </MetricList>
      );
      expect(screen.getByText("CPU Usage")).toBeInTheDocument();
      expect(screen.getByText("12.5%")).toBeInTheDocument();
    });

    it("renders many rows", () => {
      render(
        <MetricList>
          <MetricRow label="CPU Usage" value="12.5%" />
          <MetricRow label="Memory" value="245.32 MB" />
          <MetricRow label="Uptime" value="2d 5h 30m" />
          <MetricRow label="Node.js" value="v20.11.0" />
        </MetricList>
      );
      expect(screen.getByText("CPU Usage")).toBeInTheDocument();
      expect(screen.getByText("Memory")).toBeInTheDocument();
      expect(screen.getByText("Uptime")).toBeInTheDocument();
      expect(screen.getByText("Node.js")).toBeInTheDocument();
      expect(screen.getByText("245.32 MB")).toBeInTheDocument();
      expect(screen.getByText("2d 5h 30m")).toBeInTheDocument();
      expect(screen.getByText("v20.11.0")).toBeInTheDocument();
    });
  });

  describe("base styles", () => {
    it("has flex-col layout and subtle text color", () => {
      const { container } = render(<MetricList>Content</MetricList>);
      const root = container.firstChild as HTMLElement;
      expect(root).toHaveClass("flex");
      expect(root).toHaveClass("flex-col");
      expect(root).toHaveClass("text-fg-subtle");
    });
  });

  describe("className merging", () => {
    it("merges custom className with default classes", () => {
      const { container } = render(<MetricList className="custom-class">Content</MetricList>);
      const root = container.firstChild as HTMLElement;
      expect(root).toHaveClass("custom-class");
      expect(root).toHaveClass("flex");
    });
  });
});

describe("MetricRow", () => {
  describe("rendering", () => {
    it("renders the label and value", () => {
      render(<MetricRow label="Requests/min" value="127" />);
      expect(screen.getByText("Requests/min")).toBeInTheDocument();
      expect(screen.getByText("127")).toBeInTheDocument();
    });

    it("renders a ReactNode value", () => {
      render(<MetricRow label="Google Calendar" value={<span data-testid="status">Connected</span>} />);
      expect(screen.getByTestId("status")).toBeInTheDocument();
      expect(screen.getByText("Connected")).toBeInTheDocument();
    });

    it("has justify-between layout", () => {
      const { container } = render(<MetricRow label="Total" value="1,247" />);
      expect(container.firstChild as HTMLElement).toHaveClass("justify-between");
    });
  });

  describe("valueVariant", () => {
    it.each([
      ["normal", "text-fg-normal"],
      ["success", "text-fg-success"],
      ["warning", "text-fg-warning"],
      ["danger", "text-fg-danger"],
      ["info", "text-fg-brand"],
    ] as const)("applies %s value variant class", (valueVariant, expectedClass) => {
      render(<MetricRow label="Status" value="OK" valueVariant={valueVariant} />);
      expect(screen.getByText("OK")).toHaveClass(expectedClass);
    });

    it("defaults to the normal value variant when not specified", () => {
      render(<MetricRow label="Status" value="OK" />);
      expect(screen.getByText("OK")).toHaveClass("text-fg-normal");
    });
  });

  describe("edge cases", () => {
    it("renders a numeric-looking long value that would wrap", () => {
      render(<MetricRow label="Disk Available" value="54.77 GB of 100.00 GB total available across all mounted volumes" />);
      expect(screen.getByText("54.77 GB of 100.00 GB total available across all mounted volumes")).toBeInTheDocument();
    });
  });

  describe("className merging", () => {
    it("merges custom className with default classes", () => {
      const { container } = render(<MetricRow label="Total" value="1" className="custom-class" />);
      const root = container.firstChild as HTMLElement;
      expect(root).toHaveClass("custom-class");
      expect(root).toHaveClass("flex");
    });
  });
});
