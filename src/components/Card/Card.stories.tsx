import { Badge } from "@sixthshift/design-system/badge";
import { Button } from "@sixthshift/design-system/button";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { componentTokensStory } from "../../stories/component-tokens/componentTokensStory";
import { Card } from ".";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  parameters: {
    layout: "centered",
    docs: { subtitle: "A bordered container, optionally clickable" },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Card>;

/**
 * A card with `onClick` becomes a real button — focusable, and activated by
 * `Enter` as well as a click.
 */
export const ClickablePlay: Story = {
  render: function ClickablePlayStory() {
    const [opened, setOpened] = useState(0);
    return (
      <Card className="w-87.5" title="Card Title" onClick={() => setOpened((n) => n + 1)}>
        <p className="text-fg-subtle text-sm">Opened {opened} times</p>
      </Card>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole("button");

    await userEvent.click(card);
    await expect(canvas.getByText("Opened 1 times")).toBeInTheDocument();

    card.focus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByText("Opened 2 times")).toBeInTheDocument();
  },
};

export const Default: Story = {
  render: () => (
    <Card className="w-87.5" title="Card Title">
      <p className="text-fg-subtle text-sm">Card description goes here.</p>
      <p className="mt-4">Card content goes here.</p>
    </Card>
  ),
};

export const WithHeaderAction: Story = {
  render: () => (
    <Card className="w-87.5" title="Card Title" headerAction={<Button size="sm">Action</Button>}>
      <p>Card content goes here.</p>
    </Card>
  ),
};

export const SimpleContent: Story = {
  render: () => (
    <Card className="w-87.5">
      <p>Just content, no title needed.</p>
    </Card>
  ),
};

export const BillCard: Story = {
  render: () => (
    <Card className="w-87.5" title="Electric Bill" headerAction={<Badge intent="warning">Due Soon</Badge>}>
      <div className="font-bold text-2xl">$142.50</div>
      <p className="text-fg-subtle text-xs">Due December 20, 2025</p>
      <div className="mt-4 flex justify-between">
        <Button variant="outline" size="sm">
          View Details
        </Button>
        <Button size="sm" intent="success">
          Mark Paid
        </Button>
      </div>
    </Card>
  ),
};

export const StatsCard: Story = {
  render: () => (
    <Card className="w-50">
      <p className="text-fg-subtle text-sm">Total Revenue</p>
      <h3 className="font-semibold text-3xl">$45,231.89</h3>
      <p className="mt-2 text-fg-subtle text-xs">
        <span className="text-fg-success">+20.1%</span> from last month
      </p>
    </Card>
  ),
};

export const CardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <p className="text-fg-subtle text-sm">Tasks</p>
        <h3 className="font-semibold text-2xl">12</h3>
        <p className="mt-1 text-fg-subtle text-xs">3 due today</p>
      </Card>
      <Card>
        <p className="text-fg-subtle text-sm">Events</p>
        <h3 className="font-semibold text-2xl">4</h3>
        <p className="mt-1 text-fg-subtle text-xs">This week</p>
      </Card>
      <Card>
        <p className="text-fg-subtle text-sm">Bills</p>
        <h3 className="font-semibold text-2xl">$892</h3>
        <p className="mt-1 text-fg-subtle text-xs">Due this month</p>
      </Card>
      <Card>
        <p className="text-fg-subtle text-sm">Contacts</p>
        <h3 className="font-semibold text-2xl">248</h3>
        <p className="mt-1 text-fg-subtle text-xs">5 new this week</p>
      </Card>
    </div>
  ),
};

export const CustomTitle: Story = {
  render: () => (
    <Card
      className="w-87.5"
      title={
        <div className="flex items-center gap-2">
          <span className="text-lg">Custom Title</span>
          <Badge>New</Badge>
        </div>
      }
    >
      <p>When you need more control over the title, pass a ReactNode.</p>
    </Card>
  ),
};

export const InlineContent: Story = {
  render: () => (
    <Card className="flex items-center gap-2 px-4 py-3">
      <div className="h-2 w-2 rounded-full bg-fg-success" />
      <span>Inline content works without flex-col interference</span>
    </Card>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Card className="w-87.5" title="Clickable Card" onClick={() => alert("Card clicked!")}>
      <p className="text-fg-subtle text-sm">Hover to see the border highlight. Click or press Enter/Space to activate.</p>
    </Card>
  ),
};

export const InteractiveGrid: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      {["Tasks", "Events", "Bills", "Contacts"].map((label) => (
        <Card key={label} onClick={() => alert(label)}>
          <p className="text-fg-subtle text-sm">{label}</p>
          <h3 className="font-semibold text-2xl">12</h3>
        </Card>
      ))}
    </div>
  ),
};

export const ComponentTokens = componentTokensStory("card");
