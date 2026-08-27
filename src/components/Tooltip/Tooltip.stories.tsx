import { Button } from "@sixthshift/design-system/button";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, screen, userEvent, within } from "storybook/test";
import { Tooltip } from "./Tooltip";

const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  component: Tooltip,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `A hover/focus-triggered short text label anchored to a trigger. Reach for
\`Tooltip\` over \`HoverCard\` when the content is a plain-text explanation —
a label, a truncated value, what an icon button does — not a card with
interactive content; reach for \`HoverCard\` once the content needs more
than a line or two, or a button of its own. Reach for \`Popover\` instead
for click-triggered content.

\`placement\` defaults to \`"top"\`, \`offsetPx\` to \`8\`, positioned through the
same \`offset → flip → shift\` + \`autoUpdate\` floating-ui middleware as
\`Popover\`/\`HoverCard\`. \`delayShow\` defaults to \`300\`ms, \`delayHide\` to
\`0\`ms — Tooltip is controlled (\`open\` + \`onOpenChange\`) but, unlike
\`Popover\`/\`HoverCard\`, has no \`defaultOpen\`; its uncontrolled default is
always closed.

Opens via \`useHover\` and \`useFocus\`, so it's reachable by keyboard, and
closes via \`useDismiss\`. \`Tooltip.Body\` carries \`role="tooltip"\` (via
\`useRole\`), renders in a \`FloatingPortal\`, and hard unmounts when closed —
no exit animation.

Compound: \`Tooltip.Trigger\`, \`Tooltip.Body\`.`,
      },
      subtitle: "A hover-triggered short text label anchored to a trigger",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

/**
 * Hovered by the play function: a tooltip that is never shown is a tooltip axe
 * never checks. `delayShow` is 300ms by default, so the query waits.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole("button", { name: "Hover me" }));
    await expect(await screen.findByRole("tooltip", {}, { timeout: 2000 })).toBeInTheDocument();
  },
  render: () => (
    <Tooltip>
      <Tooltip.Trigger asChild>
        <Button variant="outline">Hover me</Button>
      </Tooltip.Trigger>
      <Tooltip.Body>This is a tooltip</Tooltip.Body>
    </Tooltip>
  ),
};

export const Placements: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      {(["top-start", "top", "top-end", "left", null, "right", "bottom-start", "bottom", "bottom-end"] as const).map((placement, i) =>
        placement ? (
          <Tooltip key={placement} placement={placement}>
            <Tooltip.Trigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                {placement}
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Body>Placement: {placement}</Tooltip.Body>
          </Tooltip>
        ) : (
          <div key={i} />
        )
      )}
    </div>
  ),
};

export const WithDelay: Story = {
  render: () => (
    <div className="flex gap-4">
      <Tooltip delayShow={0}>
        <Tooltip.Trigger asChild>
          <Button variant="outline">No delay</Button>
        </Tooltip.Trigger>
        <Tooltip.Body>Appears instantly</Tooltip.Body>
      </Tooltip>

      <Tooltip delayShow={500}>
        <Tooltip.Trigger asChild>
          <Button variant="outline">500ms delay</Button>
        </Tooltip.Trigger>
        <Tooltip.Body>Appears after 500ms</Tooltip.Body>
      </Tooltip>

      <Tooltip delayShow={1000}>
        <Tooltip.Trigger asChild>
          <Button variant="outline">1s delay</Button>
        </Tooltip.Trigger>
        <Tooltip.Body>Appears after 1 second</Tooltip.Body>
      </Tooltip>
    </div>
  ),
};

export const OnIconButton: Story = {
  render: () => (
    <div className="flex gap-2">
      <Tooltip>
        <Tooltip.Trigger asChild>
          <Button variant="ghost" iconOnly>
            ✏️
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Body>Edit</Tooltip.Body>
      </Tooltip>

      <Tooltip>
        <Tooltip.Trigger asChild>
          <Button variant="ghost" iconOnly>
            🗑️
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Body>Delete</Tooltip.Body>
      </Tooltip>

      <Tooltip>
        <Tooltip.Trigger asChild>
          <Button variant="ghost" iconOnly>
            ⚙️
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Body>Settings</Tooltip.Body>
      </Tooltip>
    </div>
  ),
};

export const LongContent: Story = {
  render: () => (
    <Tooltip>
      <Tooltip.Trigger asChild>
        <Button variant="outline">Hover for details</Button>
      </Tooltip.Trigger>
      <Tooltip.Body className="max-w-xs">This is a longer tooltip that wraps to multiple lines when the content exceeds the maximum width.</Tooltip.Body>
    </Tooltip>
  ),
};

export const OnText: Story = {
  render: () => (
    <p className="text-sm">
      Hover over the{" "}
      <Tooltip>
        <Tooltip.Trigger asChild>
          <span className="cursor-help border-fg-subtle border-b border-dashed">underlined text</span>
        </Tooltip.Trigger>
        <Tooltip.Body>This explains the term</Tooltip.Body>
      </Tooltip>{" "}
      to see a tooltip.
    </p>
  ),
};

export const Keyboard: Story = {
  name: "Keyboard Focus",
  render: () => (
    <div className="flex gap-4">
      <Tooltip>
        <Tooltip.Trigger asChild>
          <Button>Tab to focus</Button>
        </Tooltip.Trigger>
        <Tooltip.Body>Tooltip appears on focus too</Tooltip.Body>
      </Tooltip>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <Button variant="outline">Second button</Button>
        </Tooltip.Trigger>
        <Tooltip.Body>Another tooltip</Tooltip.Body>
      </Tooltip>
    </div>
  ),
};
