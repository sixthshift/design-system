/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { HoverCard } from "./HoverCard";

describe("HoverCard", () => {
  describe("controlled mode", () => {
    it("does not render content when closed", () => {
      render(
        <HoverCard open={false}>
          <HoverCard.Trigger asChild>
            <button type="button">Trigger</button>
          </HoverCard.Trigger>
          <HoverCard.Content>Content</HoverCard.Content>
        </HoverCard>
      );
      expect(screen.queryByText("Content")).not.toBeInTheDocument();
    });

    it("renders content when open", () => {
      render(
        <HoverCard open={true}>
          <HoverCard.Trigger asChild>
            <button type="button">Trigger</button>
          </HoverCard.Trigger>
          <HoverCard.Content>Content</HoverCard.Content>
        </HoverCard>
      );
      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("calls onOpenChange when the trigger is focused", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();
      render(
        <HoverCard open={false} onOpenChange={handleOpenChange}>
          <HoverCard.Trigger asChild>
            <button type="button">Trigger</button>
          </HoverCard.Trigger>
          <HoverCard.Content>Content</HoverCard.Content>
        </HoverCard>
      );

      await user.tab();
      expect(handleOpenChange).toHaveBeenCalledWith(true);
    });

    it("does not update the displayed content when the open prop does not change", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();
      render(
        <HoverCard open={false} onOpenChange={handleOpenChange}>
          <HoverCard.Trigger asChild>
            <button type="button">Trigger</button>
          </HoverCard.Trigger>
          <HoverCard.Content>Content</HoverCard.Content>
        </HoverCard>
      );

      await user.tab();
      // Consumer is notified, but since it did not update `open`, content stays hidden.
      expect(screen.queryByText("Content")).not.toBeInTheDocument();
    });
  });

  describe("uncontrolled mode", () => {
    it("starts closed by default", () => {
      render(
        <HoverCard>
          <HoverCard.Trigger asChild>
            <button type="button">Trigger</button>
          </HoverCard.Trigger>
          <HoverCard.Content>Content</HoverCard.Content>
        </HoverCard>
      );
      expect(screen.queryByText("Content")).not.toBeInTheDocument();
    });

    it("can start open with defaultOpen", () => {
      render(
        <HoverCard defaultOpen={true}>
          <HoverCard.Trigger asChild>
            <button type="button">Trigger</button>
          </HoverCard.Trigger>
          <HoverCard.Content>Content</HoverCard.Content>
        </HoverCard>
      );
      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("opens when the trigger receives focus", async () => {
      const user = userEvent.setup();
      render(
        <HoverCard>
          <HoverCard.Trigger asChild>
            <button type="button">Trigger</button>
          </HoverCard.Trigger>
          <HoverCard.Content>Content</HoverCard.Content>
        </HoverCard>
      );

      expect(screen.queryByText("Content")).not.toBeInTheDocument();

      await user.tab();
      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("closes when focus moves away", async () => {
      const user = userEvent.setup();
      render(
        <div>
          <HoverCard>
            <HoverCard.Trigger asChild>
              <button type="button">Trigger</button>
            </HoverCard.Trigger>
            <HoverCard.Content>Content</HoverCard.Content>
          </HoverCard>
          <button type="button">Other button</button>
        </div>
      );

      await user.tab();
      expect(screen.getByText("Content")).toBeInTheDocument();

      await user.tab();
      expect(screen.queryByText("Content")).not.toBeInTheDocument();
    });
  });
});

describe("HoverCard.Trigger", () => {
  it("renders as a Slot (asChild) by default, cloning props onto the child", () => {
    render(
      <HoverCard>
        <HoverCard.Trigger>
          <span data-testid="trigger">Trigger text</span>
        </HoverCard.Trigger>
        <HoverCard.Content>Content</HoverCard.Content>
      </HoverCard>
    );
    const trigger = screen.getByTestId("trigger");
    expect(trigger.tagName).toBe("SPAN");
    expect(trigger).toHaveTextContent("Trigger text");
  });

  it("renders as a span wrapper when asChild is false", () => {
    render(
      <HoverCard>
        <HoverCard.Trigger asChild={false}>Trigger text</HoverCard.Trigger>
        <HoverCard.Content>Content</HoverCard.Content>
      </HoverCard>
    );
    expect(screen.getByText("Trigger text").tagName).toBe("SPAN");
  });

  it("supports asChild with an arbitrary element like a button", () => {
    render(
      <HoverCard>
        <HoverCard.Trigger asChild>
          <button type="button">Button trigger</button>
        </HoverCard.Trigger>
        <HoverCard.Content>Content</HoverCard.Content>
      </HoverCard>
    );
    expect(screen.getByRole("button", { name: "Button trigger" })).toBeInTheDocument();
  });

  it("spreads additional props onto the trigger", () => {
    render(
      <HoverCard>
        <HoverCard.Trigger asChild data-testid="trigger" aria-label="Info">
          <button type="button">?</button>
        </HoverCard.Trigger>
        <HoverCard.Content>Content</HoverCard.Content>
      </HoverCard>
    );
    expect(screen.getByTestId("trigger")).toHaveAttribute("aria-label", "Info");
  });
});

describe("HoverCard.Content", () => {
  it("renders children", () => {
    render(
      <HoverCard open={true}>
        <HoverCard.Trigger asChild>
          <button type="button">Trigger</button>
        </HoverCard.Trigger>
        <HoverCard.Content>Helpful profile information</HoverCard.Content>
      </HoverCard>
    );
    expect(screen.getByText("Helpful profile information")).toBeInTheDocument();
  });

  it("applies styling classes", () => {
    render(
      <HoverCard open={true}>
        <HoverCard.Trigger asChild>
          <button type="button">Trigger</button>
        </HoverCard.Trigger>
        <HoverCard.Content data-testid="content">Content</HoverCard.Content>
      </HoverCard>
    );
    const content = screen.getByTestId("content");
    expect(content).toHaveClass("rounded-lg");
    expect(content).toHaveClass("w-80");
    expect(content).toHaveClass("shadow-lg");
  });

  it("supports custom className", () => {
    render(
      <HoverCard open={true}>
        <HoverCard.Trigger asChild>
          <button type="button">Trigger</button>
        </HoverCard.Trigger>
        <HoverCard.Content className="custom-class">Content</HoverCard.Content>
      </HoverCard>
    );
    expect(screen.getByText("Content")).toHaveClass("custom-class");
  });

  it("does not render into the DOM at all when closed", () => {
    render(
      <HoverCard open={false}>
        <HoverCard.Trigger asChild>
          <button type="button">Trigger</button>
        </HoverCard.Trigger>
        <HoverCard.Content data-testid="content">Content</HoverCard.Content>
      </HoverCard>
    );
    expect(screen.queryByTestId("content")).not.toBeInTheDocument();
  });
});

describe("HoverCard dismissal", () => {
  it("closes on Escape key while open", async () => {
    const user = userEvent.setup();
    render(
      <HoverCard defaultOpen={true}>
        <HoverCard.Trigger asChild>
          <button type="button">Trigger</button>
        </HoverCard.Trigger>
        <HoverCard.Content>Content</HoverCard.Content>
      </HoverCard>
    );

    expect(screen.getByText("Content")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
  });
});

describe("HoverCard full composition", () => {
  it("renders trigger and content together when open", () => {
    render(
      <HoverCard open={true}>
        <HoverCard.Trigger asChild>
          <span>@jane-doe</span>
        </HoverCard.Trigger>
        <HoverCard.Content>
          <h4>Jane Doe</h4>
          <p>Software Engineer</p>
        </HoverCard.Content>
      </HoverCard>
    );

    expect(screen.getByText("@jane-doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
  });
});

describe("edge cases", () => {
  it("supports multiple independent hover cards on the page", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <HoverCard>
          <HoverCard.Trigger asChild>
            <button type="button">First trigger</button>
          </HoverCard.Trigger>
          <HoverCard.Content>First content</HoverCard.Content>
        </HoverCard>
        <HoverCard>
          <HoverCard.Trigger asChild>
            <button type="button">Second trigger</button>
          </HoverCard.Trigger>
          <HoverCard.Content>Second content</HoverCard.Content>
        </HoverCard>
      </div>
    );

    await user.tab();
    expect(screen.getByText("First content")).toBeInTheDocument();
    expect(screen.queryByText("Second content")).not.toBeInTheDocument();

    await user.tab();
    expect(screen.queryByText("First content")).not.toBeInTheDocument();
    expect(screen.getByText("Second content")).toBeInTheDocument();
  });
});
