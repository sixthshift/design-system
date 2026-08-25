import { Button } from "@sixthshift/design-system/button";
import { Input } from "@sixthshift/design-system/input";
import { Label } from "@sixthshift/design-system/label";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Popover } from "./Popover";

const meta: Meta<typeof Popover> = {
  title: "Components/Feedback/Popover",
  component: Popover,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <Popover>
      <Popover.Trigger asChild>
        <Button>Open Popover</Button>
      </Popover.Trigger>
      <Popover.Body>
        <p className="text-sm">This is a popover with some content.</p>
      </Popover.Body>
    </Popover>
  ),
};

export const Placements: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      {(["top-start", "top", "top-end", "left", null, "right", "bottom-start", "bottom", "bottom-end"] as const).map((placement, i) =>
        placement ? (
          <Popover key={placement} placement={placement}>
            <Popover.Trigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                {placement}
              </Button>
            </Popover.Trigger>
            <Popover.Body>
              <p className="text-sm">Placement: {placement}</p>
            </Popover.Body>
          </Popover>
        ) : (
          <div key={i} />
        )
      )}
    </div>
  ),
};

export const Controlled: Story = {
  render: function ControlledExample() {
    const [open, setOpen] = useState(false);

    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            Open
          </Button>
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
        <p className="text-fg-subtle text-sm">Popover is: {open ? "Open" : "Closed"}</p>
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Button>Controlled Popover</Button>
          </Popover.Trigger>
          <Popover.Body>
            <p className="text-sm">This popover is controlled externally.</p>
          </Popover.Body>
        </Popover>
      </div>
    );
  },
};

export const WithForm: Story = {
  render: () => (
    <Popover>
      <Popover.Trigger asChild>
        <Button>Edit Dimensions</Button>
      </Popover.Trigger>
      <Popover.Body className="w-72">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Dimensions</h4>
            <p className="text-fg-subtle text-sm">Set the dimensions for the layer.</p>
          </div>
          <div className="grid gap-3">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="width">Width</Label>
              <Input id="width" defaultValue="100%" className="col-span-2 h-8" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="height">Height</Label>
              <Input id="height" defaultValue="25px" className="col-span-2 h-8" />
            </div>
          </div>
        </div>
      </Popover.Body>
    </Popover>
  ),
};

export const WithClose: Story = {
  render: () => (
    <Popover>
      <Popover.Trigger asChild>
        <Button>Open with Close Button</Button>
      </Popover.Trigger>
      <Popover.Body>
        <div className="flex flex-col gap-3">
          <p className="text-sm">Click the button below to close.</p>
          <Popover.Close asChild>
            <Button size="sm">Close Popover</Button>
          </Popover.Close>
        </div>
      </Popover.Body>
    </Popover>
  ),
};

export const RichContent: Story = {
  render: () => (
    <Popover>
      <Popover.Trigger asChild>
        <Button variant="outline">View Details</Button>
      </Popover.Trigger>
      <Popover.Body className="w-80">
        <div className="flex gap-4">
          <div className="h-12 w-12 rounded-full bg-bg-subtle" />
          <div className="flex-1">
            <h4 className="font-semibold text-sm">John Doe</h4>
            <p className="text-fg-subtle text-sm">Software Engineer</p>
            <p className="mt-2 text-sm">Working on the new dashboard features and API integrations.</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">
            Message
          </Button>
          <Button size="sm" className="flex-1">
            View Profile
          </Button>
        </div>
      </Popover.Body>
    </Popover>
  ),
};

export const CustomOffset: Story = {
  render: () => (
    <div className="flex gap-8">
      <Popover offsetPx={4}>
        <Popover.Trigger asChild>
          <Button variant="outline">4px offset</Button>
        </Popover.Trigger>
        <Popover.Body>
          <p className="text-sm">Small offset (4px)</p>
        </Popover.Body>
      </Popover>

      <Popover offsetPx={16}>
        <Popover.Trigger asChild>
          <Button variant="outline">16px offset</Button>
        </Popover.Trigger>
        <Popover.Body>
          <p className="text-sm">Large offset (16px)</p>
        </Popover.Body>
      </Popover>
    </div>
  ),
};
