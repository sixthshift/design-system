import { Button } from "@sixthshift/design-system/button";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, screen, userEvent, within } from "storybook/test";
import { HoverCard } from "./HoverCard";

const meta: Meta<typeof HoverCard> = {
  title: "Components/HoverCard",
  component: HoverCard,
  parameters: {
    docs: {
      subtitle: "A hover-triggered floating card for richer info-on-demand",
      description: {
        component: `A hover/focus-triggered floating card for richer info-on-demand — a user
profile, an entity preview — anchored to an inline trigger like a name or
a link. Reach for \`HoverCard\` over \`Tooltip\` when the content is more than
a short text label (an avatar, multiple lines, action buttons); reach for
\`Tooltip\` when it's a terse label. Reach for \`Popover\` instead when the
panel should open on click rather than passively on hover.

Works both controlled (\`open\` + \`onOpenChange\`) and uncontrolled
(\`defaultOpen\`) via \`useControllableState\`, same as \`Popover\`. \`placement\`
defaults to \`"bottom-start"\`, \`offsetPx\` to \`8\`, positioned through the
same \`offset → flip → shift\` + \`autoUpdate\` floating-ui middleware.

Opens via \`useHover\` — \`delayShow\` defaults to \`500\`ms, deliberately
longer than Tooltip's, so a hover-card doesn't pop on incidental hover —
and via \`useFocus\`, so it's reachable by keyboard. \`delayHide\` defaults to
\`200\`ms and uses \`safePolygon()\`, which lets the cursor travel from the
trigger to the card (crossing the gap between them) without the card
closing — necessary because, unlike a Tooltip, a HoverCard's content is
meant to be interactive.

\`HoverCard.Trigger\` defaults \`asChild\` to \`true\` (the reverse of
\`Popover\`/\`Tooltip\`), since a hover-card typically wraps an existing
inline element like a name rather than introducing a new one.
\`HoverCard.Content\` renders in a \`FloatingPortal\` and hard unmounts when
closed — no exit animation. Note it carries no ARIA role and isn't named
via \`aria-labelledby\` the way \`Popover.Body\` is — give it an accessible
name directly if the content isn't otherwise identifiable.

Compound: \`HoverCard.Trigger\`, \`HoverCard.Content\`.`,
      },
    },
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof HoverCard>;

/**
 * Hovered by the play function so axe sees the card itself. `delayShow` is 500ms
 * for hover-cards, so the query waits longer than a tooltip's.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByText("@jane-doe"));
    await expect(await screen.findByText("Software Engineer", {}, { timeout: 2000 })).toBeInTheDocument();
  },
  render: () => (
    <HoverCard>
      <HoverCard.Trigger>
        <span className="cursor-help border-fg-subtle border-b border-dashed">@jane-doe</span>
      </HoverCard.Trigger>
      <HoverCard.Content>
        <div className="flex gap-3">
          <div className="h-12 w-12 shrink-0 rounded-full bg-bg-subtle" />
          <div className="flex-1">
            <h4 className="font-semibold text-sm">Jane Doe</h4>
            <p className="text-fg-subtle text-xs">Software Engineer</p>
            <p className="mt-2 text-sm">Working on the new dashboard features and API integrations.</p>
          </div>
        </div>
      </HoverCard.Content>
    </HoverCard>
  ),
};

export const Placements: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      {(["top-start", "top", "top-end", "left", null, "right", "bottom-start", "bottom", "bottom-end"] as const).map((placement, i) =>
        placement ? (
          <HoverCard key={placement} placement={placement} delayShow={0}>
            <HoverCard.Trigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                {placement}
              </Button>
            </HoverCard.Trigger>
            <HoverCard.Content>
              <p className="text-sm">Placement: {placement}</p>
            </HoverCard.Content>
          </HoverCard>
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
        <p className="text-fg-subtle text-sm">HoverCard is: {open ? "Open" : "Closed"}</p>
        <HoverCard open={open} onOpenChange={setOpen}>
          <HoverCard.Trigger asChild>
            <Button>Controlled trigger</Button>
          </HoverCard.Trigger>
          <HoverCard.Content>
            <p className="text-sm">This hover-card is controlled externally — hover still works too.</p>
          </HoverCard.Content>
        </HoverCard>
      </div>
    );
  },
};

export const WithDelay: Story = {
  render: () => (
    <div className="flex gap-4">
      <HoverCard delayShow={0}>
        <HoverCard.Trigger asChild>
          <Button variant="outline">No delay</Button>
        </HoverCard.Trigger>
        <HoverCard.Content>
          <p className="text-sm">Appears instantly on hover.</p>
        </HoverCard.Content>
      </HoverCard>

      <HoverCard delayShow={500}>
        <HoverCard.Trigger asChild>
          <Button variant="outline">500ms (default)</Button>
        </HoverCard.Trigger>
        <HoverCard.Content>
          <p className="text-sm">Default delay — long enough that incidental hover doesn't trigger.</p>
        </HoverCard.Content>
      </HoverCard>

      <HoverCard delayShow={1000}>
        <HoverCard.Trigger asChild>
          <Button variant="outline">1s delay</Button>
        </HoverCard.Trigger>
        <HoverCard.Content>
          <p className="text-sm">Appears after a one-second hover.</p>
        </HoverCard.Content>
      </HoverCard>
    </div>
  ),
};

export const InlineEntityPreview: Story = {
  name: "Inline Entity Preview",
  render: () => (
    <p className="max-w-md text-sm leading-relaxed">
      Yesterday's standup was led by{" "}
      <HoverCard>
        <HoverCard.Trigger>
          <span className="cursor-help border-fg-subtle border-b border-dashed">Alex Chen</span>
        </HoverCard.Trigger>
        <HoverCard.Content>
          <div className="flex gap-3">
            <div className="h-10 w-10 shrink-0 rounded-full bg-bg-subtle" />
            <div>
              <h4 className="font-semibold text-sm">Alex Chen</h4>
              <p className="text-fg-subtle text-xs">Engineering Manager · Platform</p>
              <p className="mt-1 text-fg-subtle text-xs">Last seen 2h ago</p>
            </div>
          </div>
        </HoverCard.Content>
      </HoverCard>{" "}
      and covered the migration to{" "}
      <HoverCard>
        <HoverCard.Trigger>
          <span className="cursor-help border-fg-subtle border-b border-dashed">Project Atlas</span>
        </HoverCard.Trigger>
        <HoverCard.Content>
          <h4 className="font-semibold text-sm">Project Atlas</h4>
          <p className="text-fg-subtle text-xs">Started 2026-03-01</p>
          <p className="mt-2 text-sm">Migrating ingestion pipeline to the new domain-events model. On track for Q2 cutover.</p>
        </HoverCard.Content>
      </HoverCard>
      .
    </p>
  ),
};

export const RichContent: Story = {
  render: () => (
    <HoverCard delayShow={0}>
      <HoverCard.Trigger asChild>
        <Button variant="outline">Hover for profile</Button>
      </HoverCard.Trigger>
      <HoverCard.Content>
        <div className="flex gap-3">
          <div className="h-12 w-12 shrink-0 rounded-full bg-bg-subtle" />
          <div className="flex-1">
            <h4 className="font-semibold text-sm">John Doe</h4>
            <p className="text-fg-subtle text-xs">Software Engineer</p>
            <p className="mt-2 text-sm">Working on the new dashboard features and API integrations.</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                Message
              </Button>
              <Button size="sm" className="flex-1">
                View profile
              </Button>
            </div>
          </div>
        </div>
      </HoverCard.Content>
    </HoverCard>
  ),
};

export const CustomOffset: Story = {
  render: () => (
    <div className="flex gap-8">
      <HoverCard offsetPx={4} delayShow={0}>
        <HoverCard.Trigger asChild>
          <Button variant="outline">4px offset</Button>
        </HoverCard.Trigger>
        <HoverCard.Content>
          <p className="text-sm">Small offset (4px)</p>
        </HoverCard.Content>
      </HoverCard>

      <HoverCard offsetPx={16} delayShow={0}>
        <HoverCard.Trigger asChild>
          <Button variant="outline">16px offset</Button>
        </HoverCard.Trigger>
        <HoverCard.Content>
          <p className="text-sm">Large offset (16px)</p>
        </HoverCard.Content>
      </HoverCard>
    </div>
  ),
};

export const KeyboardFocus: Story = {
  name: "Keyboard Focus",
  render: () => (
    <div className="flex gap-4">
      <HoverCard>
        <HoverCard.Trigger asChild>
          <Button>Tab to focus</Button>
        </HoverCard.Trigger>
        <HoverCard.Content>
          <p className="text-sm">Hover-card also opens on keyboard focus.</p>
        </HoverCard.Content>
      </HoverCard>
      <HoverCard>
        <HoverCard.Trigger asChild>
          <Button variant="outline">Second trigger</Button>
        </HoverCard.Trigger>
        <HoverCard.Content>
          <p className="text-sm">Tabbing between triggers swaps the open card.</p>
        </HoverCard.Content>
      </HoverCard>
    </div>
  ),
};
