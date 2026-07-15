import { Button } from "@sixthshift/ui/button";
import { Input } from "@sixthshift/ui/input";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Sheet, SheetBody, SheetFooter, SheetHeader } from ".";

const meta: Meta<typeof Sheet> = {
  title: "Components/Feedback/Sheet",
  component: Sheet,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Sheet>;

function BackgroundContent() {
  return (
    <div className="flex-1 space-y-4">
      <p className="text-fg-subtle text-sm">
        The page behind a Sheet stays interactive. Try scrolling or clicking on this text while the sheet is open — nothing is locked.
      </p>
      {Array.from({ length: 30 }).map((_, i) => (
        <p key={i} className="text-fg-subtle text-sm">
          Background paragraph {i + 1}. Scroll works while the sheet is open.
        </p>
      ))}
    </div>
  );
}

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="flex min-h-screen items-start gap-4 p-8">
        <div className="flex-1">
          <Button onClick={() => setOpen(true)}>Open Sheet</Button>
          <BackgroundContent />
        </div>
        <Sheet open={open} onOpenChange={setOpen} closable>
          <SheetHeader>
            <h3 className="font-semibold">Sheet Title</h3>
            <p className="text-fg-subtle text-sm">Right side, medium width, no backdrop.</p>
          </SheetHeader>
          <SheetBody>
            <p>Sheet body content. The app behind this sheet is still visible and interactive.</p>
          </SheetBody>
          <SheetFooter className="justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Save</Button>
          </SheetFooter>
        </Sheet>
      </div>
    );
  },
};

export const LeftSide: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="flex min-h-screen items-start gap-4 p-8">
        <div className="flex-1">
          <Button onClick={() => setOpen(true)}>Open Left Sheet</Button>
          <BackgroundContent />
        </div>
        <Sheet open={open} onOpenChange={setOpen} side="left" closable>
          <SheetHeader>
            <h3 className="font-semibold">Left Sheet</h3>
          </SheetHeader>
          <SheetBody>
            <p>Slides in from the left edge.</p>
          </SheetBody>
        </Sheet>
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const [size, setSize] = useState<"sm" | "md" | "lg">("md");
    const [open, setOpen] = useState(false);
    return (
      <div className="flex min-h-screen items-start gap-4 p-8">
        <div className="flex gap-2">
          {(["sm", "md", "lg"] as const).map((s) => (
            <Button
              key={s}
              variant="outline"
              onClick={() => {
                setSize(s);
                setOpen(true);
              }}
            >
              {s}
            </Button>
          ))}
        </div>
        <Sheet open={open} onOpenChange={setOpen} size={size} closable>
          <SheetHeader>
            <h3 className="font-semibold">Size: {size}</h3>
          </SheetHeader>
          <SheetBody>
            <p>This sheet uses the {size} size.</p>
          </SheetBody>
        </Sheet>
      </div>
    );
  },
};

export const ChatShape: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("");
    return (
      <div className="flex min-h-screen items-start gap-4 p-8">
        <div className="flex-1">
          <Button onClick={() => setOpen(true)}>Open Chat Panel</Button>
          <p className="mt-4 text-fg-subtle text-sm">Sheet with a pinned composer footer — the shape chat will use.</p>
        </div>
        <Sheet open={open} onOpenChange={setOpen} size="md" closable>
          <SheetHeader>
            <h3 className="font-semibold">Chat</h3>
          </SheetHeader>
          <SheetBody className="space-y-3">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className={i % 2 === 0 ? "rounded-md bg-bg-subtle p-3" : "rounded-md border border-border-normal p-3"}>
                <p className="text-sm">Message {i + 1} — scrolls inside the body while the composer stays pinned.</p>
              </div>
            ))}
          </SheetBody>
          <SheetFooter>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setValue("");
              }}
              className="flex w-full gap-2"
            >
              <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Ask anything…" className="flex-1" />
              <Button type="submit">Send</Button>
            </form>
          </SheetFooter>
        </Sheet>
      </div>
    );
  },
};
