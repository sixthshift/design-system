/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { Sheet, SheetBody, SheetFooter, SheetHeader } from ".";

// Helper to wait for the presence effect (usePresence's show()/hide()) to flush.
const waitForAnimation = () => new Promise((r) => setTimeout(r, 50));

// Helper to trigger animationend event (happy-dom doesn't fire CSS animation events)
const triggerAnimationEnd = (element: Element) => {
  element.dispatchEvent(new Event("animationend", { bubbles: true }));
};

describe("Sheet", () => {
  describe("rendering", () => {
    it("does not render when closed", async () => {
      render(
        <Sheet open={false} onOpenChange={() => {}}>
          <SheetBody>Content</SheetBody>
        </Sheet>
      );
      await waitForAnimation();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("renders when open", async () => {
      render(
        <Sheet open={true} onOpenChange={() => {}}>
          <SheetBody>Content</SheetBody>
        </Sheet>
      );
      await waitForAnimation();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("renders children", async () => {
      render(
        <Sheet open={true} onOpenChange={() => {}}>
          <SheetBody>Sheet body content</SheetBody>
        </Sheet>
      );
      await waitForAnimation();
      expect(screen.getByText("Sheet body content")).toBeInTheDocument();
    });

    it("has role='dialog'", async () => {
      render(
        <Sheet open={true} onOpenChange={() => {}}>
          <SheetBody>Content</SheetBody>
        </Sheet>
      );
      await waitForAnimation();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("forwards ref to the sheet panel", async () => {
      const ref = vi.fn();
      render(
        <Sheet ref={ref} open={true} onOpenChange={() => {}}>
          <SheetBody>Content</SheetBody>
        </Sheet>
      );
      await waitForAnimation();
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    });
  });

  describe("side prop", () => {
    it("defaults to the right side", async () => {
      render(
        <Sheet open={true} onOpenChange={() => {}}>
          <SheetBody>Content</SheetBody>
        </Sheet>
      );
      await waitForAnimation();
      expect(screen.getByRole("dialog")).toHaveAttribute("data-side", "right");
    });

    it("supports the left side", async () => {
      render(
        <Sheet open={true} onOpenChange={() => {}} side="left">
          <SheetBody>Content</SheetBody>
        </Sheet>
      );
      await waitForAnimation();
      expect(screen.getByRole("dialog")).toHaveAttribute("data-side", "left");
    });
  });

  describe("size prop", () => {
    it.each(["sm", "md", "lg"] as const)("renders with %s size", async (size) => {
      render(
        <Sheet open={true} onOpenChange={() => {}} size={size}>
          <SheetBody>Content</SheetBody>
        </Sheet>
      );
      await waitForAnimation();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("applies the md size classes by default", async () => {
      render(
        <Sheet open={true} onOpenChange={() => {}}>
          <SheetBody>Content</SheetBody>
        </Sheet>
      );
      await waitForAnimation();
      expect(screen.getByRole("dialog")).toHaveClass("sm:w-[30rem]");
    });

    it("applies the lg size classes", async () => {
      render(
        <Sheet open={true} onOpenChange={() => {}} size="lg">
          <SheetBody>Content</SheetBody>
        </Sheet>
      );
      await waitForAnimation();
      expect(screen.getByRole("dialog")).toHaveClass("sm:w-[40rem]");
    });
  });

  describe("controlled open state", () => {
    it("mounts once open flips from false to true", async () => {
      const { rerender } = render(
        <Sheet open={false} onOpenChange={() => {}}>
          <SheetBody>Content</SheetBody>
        </Sheet>
      );
      await waitForAnimation();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      rerender(
        <Sheet open={true} onOpenChange={() => {}}>
          <SheetBody>Content</SheetBody>
        </Sheet>
      );
      await waitForAnimation();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("stays mounted through the exit animation, then unmounts on animationend", async () => {
      const { rerender } = render(
        <Sheet open={true} onOpenChange={() => {}}>
          <SheetBody>Content</SheetBody>
        </Sheet>
      );
      await waitForAnimation();
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      rerender(
        <Sheet open={false} onOpenChange={() => {}}>
          <SheetBody>Content</SheetBody>
        </Sheet>
      );
      await waitForAnimation();

      // Still mounted — exit animation is playing.
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("data-state", "exiting");

      triggerAnimationEnd(dialog);
      await waitForAnimation();

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("calls onOpenChange(false) when Escape is pressed", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();
      render(
        <Sheet open={true} onOpenChange={handleOpenChange}>
          <SheetBody>Content</SheetBody>
        </Sheet>
      );
      await waitForAnimation();

      await user.keyboard("{Escape}");
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("dismissable prop", () => {
    it("does not close on Escape when dismissable is false", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();
      render(
        <Sheet open={true} onOpenChange={handleOpenChange} dismissable={false}>
          <SheetBody>Content</SheetBody>
        </Sheet>
      );
      await waitForAnimation();

      await user.keyboard("{Escape}");
      expect(handleOpenChange).not.toHaveBeenCalled();
    });
  });

  describe("dismissOnOutsidePress prop", () => {
    it("does not close on outside press by default", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();
      render(
        <div>
          <Sheet open={true} onOpenChange={handleOpenChange}>
            <SheetBody>Content</SheetBody>
          </Sheet>
          <button type="button">Outside</button>
        </div>
      );
      await waitForAnimation();

      await user.click(screen.getByRole("button", { name: "Outside" }));
      expect(handleOpenChange).not.toHaveBeenCalled();
    });

    it("closes on outside press when dismissOnOutsidePress is true", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();
      render(
        <div>
          <Sheet open={true} onOpenChange={handleOpenChange} dismissOnOutsidePress>
            <SheetBody>Content</SheetBody>
          </Sheet>
          <button type="button">Outside</button>
        </div>
      );
      await waitForAnimation();

      await user.click(screen.getByRole("button", { name: "Outside" }));
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("closable prop", () => {
    it("shows a close button in the header when closable is true", async () => {
      render(
        <Sheet open={true} onOpenChange={() => {}} closable>
          <SheetHeader>
            <h3>Title</h3>
          </SheetHeader>
          <SheetBody>Content</SheetBody>
        </Sheet>
      );
      await waitForAnimation();
      expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
    });

    it("does not show a close button when closable is not set", async () => {
      render(
        <Sheet open={true} onOpenChange={() => {}}>
          <SheetHeader>
            <h3>Title</h3>
          </SheetHeader>
          <SheetBody>Content</SheetBody>
        </Sheet>
      );
      await waitForAnimation();
      expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
    });

    it("calls onOpenChange(false) when the close button is clicked", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();
      render(
        <Sheet open={true} onOpenChange={handleOpenChange} closable>
          <SheetHeader>
            <h3>Title</h3>
          </SheetHeader>
          <SheetBody>Content</SheetBody>
        </Sheet>
      );
      await waitForAnimation();

      await user.click(screen.getByRole("button", { name: "Close" }));
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("full open/close lifecycle via a stateful consumer", () => {
    function StatefulSheet() {
      const [open, setOpen] = useState(false);
      return (
        <div>
          <button type="button" onClick={() => setOpen(true)}>
            Open sheet
          </button>
          <Sheet open={open} onOpenChange={setOpen} closable>
            <SheetHeader>
              <h3>Title</h3>
            </SheetHeader>
            <SheetBody>Sheet content</SheetBody>
          </Sheet>
        </div>
      );
    }

    it("opens via a trigger and closes via the close button, playing the exit animation", async () => {
      const user = userEvent.setup();
      render(<StatefulSheet />);
      await waitForAnimation();

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Open sheet" }));
      await waitForAnimation();
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Close" }));
      await waitForAnimation();

      // Still present until the exit animation completes.
      const dialog = screen.getByRole("dialog");
      triggerAnimationEnd(dialog);
      await waitForAnimation();

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});

describe("SheetHeader", () => {
  it("renders header content", async () => {
    render(
      <Sheet open={true} onOpenChange={() => {}}>
        <SheetHeader>
          <h3>Sheet Header</h3>
        </SheetHeader>
        <SheetBody>Content</SheetBody>
      </Sheet>
    );
    await waitForAnimation();
    expect(screen.getByText("Sheet Header")).toBeInTheDocument();
  });

  it("applies default classes", async () => {
    render(
      <Sheet open={true} onOpenChange={() => {}}>
        <SheetHeader data-testid="header">Header</SheetHeader>
        <SheetBody>Content</SheetBody>
      </Sheet>
    );
    await waitForAnimation();
    const header = screen.getByTestId("header");
    expect(header).toHaveClass("flex");
    expect(header).toHaveClass("flex-col");
    expect(header).toHaveClass("p-6");
  });

  it("merges custom className", async () => {
    render(
      <Sheet open={true} onOpenChange={() => {}}>
        <SheetHeader data-testid="header" className="custom-class">
          Header
        </SheetHeader>
        <SheetBody>Content</SheetBody>
      </Sheet>
    );
    await waitForAnimation();
    expect(screen.getByTestId("header")).toHaveClass("custom-class");
  });
});

describe("SheetBody", () => {
  it("renders body content", async () => {
    render(
      <Sheet open={true} onOpenChange={() => {}}>
        <SheetBody>Body content here</SheetBody>
      </Sheet>
    );
    await waitForAnimation();
    expect(screen.getByText("Body content here")).toBeInTheDocument();
  });

  it("applies default classes", async () => {
    render(
      <Sheet open={true} onOpenChange={() => {}}>
        <SheetBody data-testid="body">Content</SheetBody>
      </Sheet>
    );
    await waitForAnimation();
    const body = screen.getByTestId("body");
    expect(body).toHaveClass("flex-1");
    expect(body).toHaveClass("overflow-y-auto");
  });

  it("merges custom className", async () => {
    render(
      <Sheet open={true} onOpenChange={() => {}}>
        <SheetBody data-testid="body" className="custom-class">
          Content
        </SheetBody>
      </Sheet>
    );
    await waitForAnimation();
    expect(screen.getByTestId("body")).toHaveClass("custom-class");
  });
});

describe("SheetFooter", () => {
  it("renders footer content", async () => {
    render(
      <Sheet open={true} onOpenChange={() => {}}>
        <SheetBody>Content</SheetBody>
        <SheetFooter>Footer content</SheetFooter>
      </Sheet>
    );
    await waitForAnimation();
    expect(screen.getByText("Footer content")).toBeInTheDocument();
  });

  it("applies default classes", async () => {
    render(
      <Sheet open={true} onOpenChange={() => {}}>
        <SheetBody>Content</SheetBody>
        <SheetFooter data-testid="footer">Footer</SheetFooter>
      </Sheet>
    );
    await waitForAnimation();
    const footer = screen.getByTestId("footer");
    expect(footer).toHaveClass("flex");
    expect(footer).toHaveClass("items-center");
  });

  it("merges custom className", async () => {
    render(
      <Sheet open={true} onOpenChange={() => {}}>
        <SheetBody>Content</SheetBody>
        <SheetFooter data-testid="footer" className="custom-class">
          Footer
        </SheetFooter>
      </Sheet>
    );
    await waitForAnimation();
    expect(screen.getByTestId("footer")).toHaveClass("custom-class");
  });
});

describe("Sheet composition", () => {
  it("renders the full sheet structure", async () => {
    render(
      <Sheet open={true} onOpenChange={() => {}}>
        <SheetHeader>
          <h3>Title</h3>
        </SheetHeader>
        <SheetBody>Body content</SheetBody>
        <SheetFooter>
          <button type="button">Action</button>
        </SheetFooter>
      </Sheet>
    );
    await waitForAnimation();

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Body content")).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();
  });
});

describe("className merging", () => {
  it("merges a custom className on the root sheet element", async () => {
    render(
      <Sheet open={true} onOpenChange={() => {}} className="custom-sheet">
        <SheetBody>Content</SheetBody>
      </Sheet>
    );
    await waitForAnimation();
    expect(screen.getByRole("dialog")).toHaveClass("custom-sheet");
  });
});

describe("edge cases", () => {
  it("renders with no header or footer, just a body", async () => {
    render(
      <Sheet open={true} onOpenChange={() => {}}>
        <SheetBody>Only content</SheetBody>
      </Sheet>
    );
    await waitForAnimation();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Only content")).toBeInTheDocument();
  });
});

describe("Sheet accessible name", () => {
  it("names the dialog from its header", async () => {
    render(
      <Sheet open onOpenChange={() => {}}>
        <SheetHeader>Task details</SheetHeader>
        <SheetBody>Content</SheetBody>
      </Sheet>
    );
    await waitForAnimation();

    const dialog = screen.getByRole("dialog");
    const header = screen.getByText("Task details");
    expect(header.id).not.toBe("");
    expect(dialog).toHaveAttribute("aria-labelledby", header.id);
    expect(screen.getByRole("dialog", { name: "Task details" })).toBe(dialog);
  });

  it("leaves aria-labelledby off when there is no header", async () => {
    render(
      <Sheet open onOpenChange={() => {}}>
        <SheetBody>Content</SheetBody>
      </Sheet>
    );
    await waitForAnimation();
    expect(screen.getByRole("dialog")).not.toHaveAttribute("aria-labelledby");
  });

  it("prefers a caller-supplied label over the header", async () => {
    render(
      <Sheet open onOpenChange={() => {}} aria-label="Inspector">
        <SheetHeader>Task details</SheetHeader>
        <SheetBody>Content</SheetBody>
      </Sheet>
    );
    await waitForAnimation();
    expect(screen.getByRole("dialog", { name: "Inspector" })).toBeInTheDocument();
  });
});
