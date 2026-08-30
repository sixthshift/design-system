import type { Meta, StoryObj } from "@storybook/react";
import { Bold, Grid, Italic, List, Underline } from "lucide-react";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { componentTokensStory } from "../../stories/component-tokens/componentTokensStory";
import { Toggle } from "./Toggle";

const meta: Meta<typeof Toggle> = {
  title: "Components/Toggle",
  component: Toggle,
  parameters: {
    layout: "centered",
    docs: { subtitle: "A single pressed/unpressed button, built on Button's variant and intent" },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["solid", "outline", "ghost", "link"],
    },
    intent: {
      control: "select",
      options: ["brand", "neutral", "danger", "success", "warning"],
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Toggle>;

/**
 * Pressing toggles `aria-pressed`, and the pressed treatment is real CSS.
 */
export const PressPlay: Story = {
  render: function PressPlayStory() {
    const [pressed, setPressed] = useState(false);
    return (
      <Toggle pressed={pressed} onPressedChange={setPressed} aria-label="Toggle bold">
        Bold
      </Toggle>
    );
  },
  play: async ({ canvasElement }) => {
    const toggle = within(canvasElement).getByRole("button", { name: "Toggle bold" });
    const background = () => getComputedStyle(toggle).backgroundColor;

    const idle = background();
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    // Polled: `transition-colors` means an immediate read is still the old value.
    await waitFor(() => expect(background()).not.toBe(idle));

    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
  },
};

export const Default: Story = {
  args: {
    children: "Bold",
    "aria-label": "Toggle bold",
  },
};

export const Pressed: Story = {
  args: {
    children: "Bold",
    pressed: true,
    "aria-label": "Toggle bold",
  },
};

export const Disabled: Story = {
  args: {
    children: "Bold",
    disabled: true,
    "aria-label": "Toggle bold",
  },
};

export const Controlled: Story = {
  render: function ControlledToggle() {
    const [pressed, setPressed] = useState(false);
    return (
      <div className="flex flex-col items-center gap-4">
        <Toggle pressed={pressed} onPressedChange={setPressed} aria-label="Toggle bold">
          Bold
        </Toggle>
        <p className="text-fg-subtle text-sm">Status: {pressed ? "On" : "Off"}</p>
      </div>
    );
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Toggle variant="solid">Solid</Toggle>
        <Toggle variant="solid" pressed>
          Solid On
        </Toggle>
      </div>
      <div className="flex items-center gap-2">
        <Toggle variant="outline">Outline</Toggle>
        <Toggle variant="outline" pressed>
          Outline On
        </Toggle>
      </div>
      <div className="flex items-center gap-2">
        <Toggle variant="ghost">Ghost</Toggle>
        <Toggle variant="ghost" pressed>
          Ghost On
        </Toggle>
      </div>
      <div className="flex items-center gap-2">
        <Toggle variant="link">Link</Toggle>
        <Toggle variant="link" pressed>
          Link On
        </Toggle>
      </div>
    </div>
  ),
};

export const Intents: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Toggle intent="neutral">Neutral</Toggle>
        <Toggle intent="neutral" pressed>
          On
        </Toggle>
      </div>
      <div className="flex items-center gap-2">
        <Toggle intent="danger">Danger</Toggle>
        <Toggle intent="danger" pressed>
          On
        </Toggle>
      </div>
      <div className="flex items-center gap-2">
        <Toggle intent="success">Success</Toggle>
        <Toggle intent="success" pressed>
          On
        </Toggle>
      </div>
      <div className="flex items-center gap-2">
        <Toggle intent="warning">Warning</Toggle>
        <Toggle intent="warning" pressed>
          On
        </Toggle>
      </div>
    </div>
  ),
};

export const OutlineIntents: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Toggle variant="outline" intent="neutral">
          Neutral
        </Toggle>
        <Toggle variant="outline" intent="neutral" pressed>
          On
        </Toggle>
      </div>
      <div className="flex items-center gap-2">
        <Toggle variant="outline" intent="danger">
          Danger
        </Toggle>
        <Toggle variant="outline" intent="danger" pressed>
          On
        </Toggle>
      </div>
      <div className="flex items-center gap-2">
        <Toggle variant="outline" intent="success">
          Success
        </Toggle>
        <Toggle variant="outline" intent="success" pressed>
          On
        </Toggle>
      </div>
      <div className="flex items-center gap-2">
        <Toggle variant="outline" intent="warning">
          Warning
        </Toggle>
        <Toggle variant="outline" intent="warning" pressed>
          On
        </Toggle>
      </div>
    </div>
  ),
};

export const GhostIntents: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Toggle variant="ghost" intent="neutral">
          Neutral
        </Toggle>
        <Toggle variant="ghost" intent="neutral" pressed>
          On
        </Toggle>
      </div>
      <div className="flex items-center gap-2">
        <Toggle variant="ghost" intent="danger">
          Danger
        </Toggle>
        <Toggle variant="ghost" intent="danger" pressed>
          On
        </Toggle>
      </div>
      <div className="flex items-center gap-2">
        <Toggle variant="ghost" intent="success">
          Success
        </Toggle>
        <Toggle variant="ghost" intent="success" pressed>
          On
        </Toggle>
      </div>
      <div className="flex items-center gap-2">
        <Toggle variant="ghost" intent="warning">
          Warning
        </Toggle>
        <Toggle variant="ghost" intent="warning" pressed>
          On
        </Toggle>
      </div>
    </div>
  ),
};

export const ToolbarExample: Story = {
  render: () => (
    <div className="flex items-center gap-1">
      <Toggle variant="ghost" iconOnly aria-label="Toggle bold">
        <Bold />
      </Toggle>
      <Toggle variant="ghost" iconOnly aria-label="Toggle italic">
        <Italic />
      </Toggle>
      <Toggle variant="ghost" iconOnly aria-label="Toggle underline">
        <Underline />
      </Toggle>
    </div>
  ),
};

export const ViewSwitcher: Story = {
  render: function ViewSwitcherExample() {
    const [view, setView] = useState<"grid" | "list">("grid");
    return (
      <div className="flex items-center gap-1">
        <Toggle variant="outline" iconOnly pressed={view === "grid"} onPressedChange={() => setView("grid")} aria-label="Grid view">
          <Grid />
        </Toggle>
        <Toggle variant="outline" iconOnly pressed={view === "list"} onPressedChange={() => setView("list")} aria-label="List view">
          <List />
        </Toggle>
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Toggle size="xs">XS</Toggle>
      <Toggle size="sm">Small</Toggle>
      <Toggle size="md">Medium</Toggle>
      <Toggle size="lg">Large</Toggle>
      <Toggle size="xl">XL</Toggle>
      <Toggle iconOnly aria-label="Icon toggle">
        <Bold />
      </Toggle>
    </div>
  ),
};

export const ComponentTokens = componentTokensStory("btn");
