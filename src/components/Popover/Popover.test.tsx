/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Popover } from "./Popover";

describe("Popover", () => {
  describe("controlled mode", () => {
    it("does not render body when closed", () => {
      render(
        <Popover open={false}>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Body>Content</Popover.Body>
        </Popover>
      );
      expect(screen.queryByText("Content")).not.toBeInTheDocument();
    });

    it("renders body when open", () => {
      render(
        <Popover open={true}>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Body>Content</Popover.Body>
        </Popover>
      );
      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("calls onOpenChange when open state changes", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();
      render(
        <Popover open={false} onOpenChange={handleOpenChange}>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Body>Content</Popover.Body>
        </Popover>
      );

      await user.click(screen.getByRole("button", { name: "Open" }));
      expect(handleOpenChange).toHaveBeenCalledWith(true);
    });
  });

  describe("uncontrolled mode", () => {
    it("starts closed by default", () => {
      render(
        <Popover>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Body>Content</Popover.Body>
        </Popover>
      );
      expect(screen.queryByText("Content")).not.toBeInTheDocument();
    });

    it("can start open with defaultOpen", () => {
      render(
        <Popover defaultOpen={true}>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Body>Content</Popover.Body>
        </Popover>
      );
      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("toggles on trigger click", async () => {
      const user = userEvent.setup();
      render(
        <Popover>
          <Popover.Trigger>Toggle</Popover.Trigger>
          <Popover.Body>Content</Popover.Body>
        </Popover>
      );

      // Initially closed
      expect(screen.queryByText("Content")).not.toBeInTheDocument();

      // Open
      await user.click(screen.getByRole("button", { name: "Toggle" }));
      expect(screen.getByText("Content")).toBeInTheDocument();

      // Close
      await user.click(screen.getByRole("button", { name: "Toggle" }));
      expect(screen.queryByText("Content")).not.toBeInTheDocument();
    });
  });
});

describe("Popover.Trigger", () => {
  it("renders as a button by default", () => {
    render(
      <Popover>
        <Popover.Trigger>Open Popover</Popover.Trigger>
        <Popover.Body>Content</Popover.Body>
      </Popover>
    );
    expect(screen.getByRole("button", { name: "Open Popover" })).toBeInTheDocument();
  });

  it("toggles popover on click", async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Body>Popover content</Popover.Body>
      </Popover>
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByText("Popover content")).toBeInTheDocument();
  });

  it("supports asChild prop", async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <Popover.Trigger asChild>
          <button type="button">Open as button</button>
        </Popover.Trigger>
        <Popover.Body>Content</Popover.Body>
      </Popover>
    );

    expect(screen.getByRole("button", { name: "Open as button" })).toBeInTheDocument();

    await user.click(screen.getByRole("button"));
    expect(screen.getByText("Content")).toBeInTheDocument();
  });
});

describe("Popover.Body", () => {
  it("renders children", () => {
    render(
      <Popover open={true}>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Body>Body content</Popover.Body>
      </Popover>
    );
    expect(screen.getByText("Body content")).toBeInTheDocument();
  });

  it("applies styling classes", () => {
    render(
      <Popover open={true}>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Body data-testid="body">Content</Popover.Body>
      </Popover>
    );
    const body = screen.getByTestId("body");
    expect(body).toHaveClass("rounded-lg");
    expect(body).toHaveClass("border");
    expect(body).toHaveClass("shadow-lg");
  });

  it("supports custom className", () => {
    render(
      <Popover open={true}>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Body data-testid="body" className="custom-class">
          Content
        </Popover.Body>
      </Popover>
    );
    expect(screen.getByTestId("body")).toHaveClass("custom-class");
  });
});

describe("Popover.Close", () => {
  it("closes popover when clicked", async () => {
    const user = userEvent.setup();
    const handleOpenChange = vi.fn();
    render(
      <Popover open={true} onOpenChange={handleOpenChange}>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Body>
          <Popover.Close>Close</Popover.Close>
        </Popover.Body>
      </Popover>
    );

    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it("supports asChild prop", async () => {
    const user = userEvent.setup();
    const handleOpenChange = vi.fn();
    render(
      <Popover open={true} onOpenChange={handleOpenChange}>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Body>
          <Popover.Close asChild>
            <button type="button">Close button</button>
          </Popover.Close>
        </Popover.Body>
      </Popover>
    );

    expect(screen.getByRole("button", { name: "Close button" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close button" }));
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("Popover dismissal", () => {
  it("closes on Escape key", async () => {
    const user = userEvent.setup();
    render(
      <Popover defaultOpen={true}>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Body>Content</Popover.Body>
      </Popover>
    );

    expect(screen.getByText("Content")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
  });

  it("closes on click outside", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Popover defaultOpen={true}>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Body>Content</Popover.Body>
        </Popover>
        <button type="button">Outside</button>
      </div>
    );

    expect(screen.getByText("Content")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Outside" }));
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
  });
});

describe("Popover full composition", () => {
  it("renders complete popover structure", async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <Popover.Trigger>Open Menu</Popover.Trigger>
        <Popover.Body>
          <div>Menu Item 1</div>
          <div>Menu Item 2</div>
          <Popover.Close>Close Menu</Popover.Close>
        </Popover.Body>
      </Popover>
    );

    await user.click(screen.getByRole("button", { name: "Open Menu" }));

    expect(screen.getByText("Menu Item 1")).toBeInTheDocument();
    expect(screen.getByText("Menu Item 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close Menu" })).toBeInTheDocument();
  });
});
