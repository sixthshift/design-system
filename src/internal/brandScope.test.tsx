/// <reference types="@testing-library/jest-dom" />
import { DatePicker } from "@sixthshift/design-system/date-picker";
import { HoverCard } from "@sixthshift/design-system/hover-card";
import { Modal, ModalBody } from "@sixthshift/design-system/modal";
import { Popover } from "@sixthshift/design-system/popover";
import { Select } from "@sixthshift/design-system/select";
import { Sheet, SheetBody } from "@sixthshift/design-system/sheet";
import { Toast } from "@sixthshift/design-system/toast";
import { Tooltip } from "@sixthshift/design-system/tooltip";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { closestBrand } from "./brandScope";

// Every overlay portals out of the element that set `data-brand`, so each one
// has to carry the brand across itself. These are the cases the theme cannot
// see: it only resolves what lands in the DOM.

describe("closestBrand", () => {
  it("reads the element's own data-brand before an ancestor's", () => {
    render(
      <div data-brand="lilac">
        <span data-brand="mint" data-testid="own" />
        <span data-testid="inherited" />
      </div>
    );
    expect(closestBrand(screen.getByTestId("own"))).toBe("mint");
    expect(closestBrand(screen.getByTestId("inherited"))).toBe("lilac");
  });

  it("is undefined outside any scope, and for no element", () => {
    render(<span data-testid="bare" />);
    expect(closestBrand(screen.getByTestId("bare"))).toBeUndefined();
    expect(closestBrand(null)).toBeUndefined();
  });

  it("copies an unknown or empty name verbatim: the theme, not the component, decides what it means", () => {
    render(
      <div data-brand="">
        <span data-testid="empty" />
      </div>
    );
    expect(closestBrand(screen.getByTestId("empty"))).toBe("");
  });
});

describe("anchored overlays inherit the trigger's brand", () => {
  it("Popover.Body copies the scope around its trigger", async () => {
    const user = userEvent.setup();
    render(
      <article data-brand="mint">
        <Popover>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Body>Content</Popover.Body>
        </Popover>
      </article>
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    const body = screen.getByRole("dialog");
    expect(body.closest("article")).toBeNull();
    expect(body).toHaveAttribute("data-brand", "mint");
  });

  it("Popover.Body's own brand prop outranks the trigger's scope", () => {
    render(
      <article data-brand="mint">
        <Popover open>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Body brand="lilac">Content</Popover.Body>
        </Popover>
      </article>
    );
    expect(screen.getByRole("dialog")).toHaveAttribute("data-brand", "lilac");
  });

  it("renders no data-brand outside any scope", () => {
    render(
      <Popover open>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Body>Content</Popover.Body>
      </Popover>
    );
    expect(screen.getByRole("dialog")).not.toHaveAttribute("data-brand");
  });

  it("Tooltip.Body copies the scope around its trigger", () => {
    render(
      <div data-brand="pink">
        <Tooltip open>
          <Tooltip.Trigger>Hover me</Tooltip.Trigger>
          <Tooltip.Body>Tip</Tooltip.Body>
        </Tooltip>
      </div>
    );
    expect(screen.getByRole("tooltip")).toHaveAttribute("data-brand", "pink");
  });

  it("HoverCard.Content copies the scope around its trigger", () => {
    render(
      <div data-brand="powder">
        <HoverCard open onOpenChange={() => {}}>
          <HoverCard.Trigger>
            <a href="#profile">Profile</a>
          </HoverCard.Trigger>
          <HoverCard.Content>Card</HoverCard.Content>
        </HoverCard>
      </div>
    );
    expect(screen.getByText("Card")).toHaveAttribute("data-brand", "powder");
  });

  it("Select's listbox copies the scope around its trigger", async () => {
    const user = userEvent.setup();
    render(
      <div data-brand="mint">
        <Select value="a" options={[{ value: "a", label: "Alpha" }]} onValueChange={() => {}} />
      </div>
    );
    await user.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toHaveAttribute("data-brand", "mint");
  });

  it("DatePicker's calendar copies the scope around its field", async () => {
    const user = userEvent.setup();
    render(
      <div data-brand="lilac">
        <DatePicker value="2025-01-15" />
      </div>
    );
    await user.click(screen.getByRole("button", { name: "Open calendar" }));
    expect(screen.getByRole("dialog")).toHaveAttribute("data-brand", "lilac");
  });
});

describe("dialogs inherit the brand of the control that opened them", () => {
  const ModalLauncher = ({ brand }: { brand?: string }) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>
          Open
        </button>
        {open && (
          <Modal aria-label="Dialog" onOpenChange={setOpen} {...(brand ? { brand } : {})}>
            <ModalBody>Body</ModalBody>
          </Modal>
        )}
      </>
    );
  };

  it("Modal takes the focused trigger's scope", async () => {
    const user = userEvent.setup();
    render(
      <section data-brand="mint">
        <ModalLauncher />
      </section>
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByRole("dialog")).toHaveAttribute("data-brand", "mint");
  });

  it("Modal's brand prop outranks the trigger's scope", async () => {
    const user = userEvent.setup();
    render(
      <section data-brand="mint">
        <ModalLauncher brand="pink" />
      </section>
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByRole("dialog")).toHaveAttribute("data-brand", "pink");
  });

  it("Sheet captures the trigger's scope when it opens, not when it mounts", async () => {
    const user = userEvent.setup();
    const Launcher = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open
          </button>
          <Sheet open={open} onOpenChange={setOpen} aria-label="Sheet">
            <SheetBody>Body</SheetBody>
          </Sheet>
        </>
      );
    };
    render(
      <section data-brand="lilac">
        <Launcher />
      </section>
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByRole("dialog")).toHaveAttribute("data-brand", "lilac");
  });
});

describe("Toast", () => {
  it("renders data-brand on its wrapper from the prop, and no bare brand attribute", () => {
    render(
      <Toast brand="mint" title="Saved">
        Done
      </Toast>
    );
    const wrapper = screen.getByRole("status").parentElement;
    expect(wrapper).toHaveAttribute("data-brand", "mint");
    expect(wrapper).not.toHaveAttribute("brand");
  });
});
