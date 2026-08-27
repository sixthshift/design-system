import type { Meta, StoryObj } from "@storybook/react";
import { componentTokensStory } from "../../stories/recipes/componentTokensStory";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Components/Actions/Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: { subtitle: "A single action, factored into fill, meaning and size" },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["solid", "outline", "ghost", "link"],
    },
    intent: {
      control: "select",
      options: ["neutral", "danger", "success", "warning"],
    },
    size: {
      control: "select",
      options: ["xs", "sm", "default", "lg", "xl", "icon"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: "Button",
  },
};

export const VariantIntentMatrix: Story = {
  render: () => (
    <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr] items-center gap-3">
      {/* Header row */}
      <div />
      <div className="text-center text-fg-subtle text-sm">neutral</div>
      <div className="text-center text-fg-subtle text-sm">danger</div>
      <div className="text-center text-fg-subtle text-sm">success</div>
      <div className="text-center text-fg-subtle text-sm">warning</div>

      {/* Solid row */}
      <div className="text-fg-subtle text-sm">solid</div>
      <Button variant="solid" intent="neutral">
        Button
      </Button>
      <Button variant="solid" intent="danger">
        Button
      </Button>
      <Button variant="solid" intent="success">
        Button
      </Button>
      <Button variant="solid" intent="warning">
        Button
      </Button>

      {/* Outline row */}
      <div className="text-fg-subtle text-sm">outline</div>
      <Button variant="outline" intent="neutral">
        Button
      </Button>
      <Button variant="outline" intent="danger">
        Button
      </Button>
      <Button variant="outline" intent="success">
        Button
      </Button>
      <Button variant="outline" intent="warning">
        Button
      </Button>

      {/* Ghost row */}
      <div className="text-fg-subtle text-sm">ghost</div>
      <Button variant="ghost" intent="neutral">
        Button
      </Button>
      <Button variant="ghost" intent="danger">
        Button
      </Button>
      <Button variant="ghost" intent="success">
        Button
      </Button>
      <Button variant="ghost" intent="warning">
        Button
      </Button>

      {/* Link row */}
      <div className="text-fg-subtle text-sm">link</div>
      <Button variant="link" intent="neutral">
        Button
      </Button>
      <Button variant="link" intent="danger">
        Button
      </Button>
      <Button variant="link" intent="success">
        Button
      </Button>
      <Button variant="link" intent="warning">
        Button
      </Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="xs">Extra Small</Button>
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>
      <Button size="icon">★</Button>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button>Default</Button>
      <Button disabled>Disabled</Button>
      <Button loading>Loading</Button>
      <Button loading disabled>
        Both
      </Button>
    </div>
  ),
};

export const AsChild: Story = {
  render: () => (
    <Button asChild>
      <a href="https://example.com">Link as Button</a>
    </Button>
  ),
};

export const ComponentTokens = componentTokensStory("btn");
