import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { componentTokensStory } from "../../stories/recipes/componentTokensStory";
import { type TabItem, Tabs } from "./Tabs";

const meta: Meta<typeof Tabs> = {
  title: "Components/Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `A tabbed interface: \`Tabs\` owns the selection state and provides it via
context to \`Tabs.List\` (the \`tablist\` of triggers) and \`Tabs.Panels\` (the
single active \`tabpanel\`), which can be composed anywhere inside it — e.g.
side by side for a vertical layout, stacked for horizontal.

Selection can be controlled (\`value\` + \`onValueChange\`) or uncontrolled
(\`defaultValue\`, falling back to the first non-disabled item). Only the
active panel is ever mounted — \`content\` can be a function, invoked lazily
the first time its tab becomes active — and \`aria-controls\` is only set on
the selected trigger, since an unselected one has no panel in the DOM to
point at.

\`Tabs.List\` implements the WAI-ARIA tabs keyboard pattern: arrow keys
(Left/Right, or Up/Down when \`orientation="vertical"\`) move focus *and*
selection together, wrapping at the ends; Home/End jump to the first/last
tab. Disabled items are skipped by both keyboard navigation and click.`,
      },
      subtitle: "Tabbed interface with arrow-key navigation and lazy panels",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

const basicTabs: TabItem[] = [
  { value: "details", label: "My details", content: <p>Details content here</p> },
  { value: "profile", label: "Profile", content: <p>Profile content here</p> },
  { value: "password", label: "Password", content: <p>Password content here</p> },
];

export const Default: Story = {
  render: () => (
    <Tabs items={basicTabs} defaultValue="details">
      <Tabs.List />
      <div className="mt-4">
        <Tabs.Panels />
      </div>
    </Tabs>
  ),
};

const tabsWithBadge: TabItem[] = [
  { value: "details", label: "My details", content: <p>Details content here</p> },
  { value: "profile", label: "Profile", content: <p>Profile content here</p> },
  { value: "notifications", label: "Notifications", badge: 3, content: <p>You have 3 notifications</p> },
  { value: "team", label: "Team", badge: "New", content: <p>Team content here</p> },
];

/**
 * Arrow keys move focus *and* selection, wrapping at the ends.
 *
 * Asserted here rather than only in the unit tests because a roving `tabIndex`
 * is about where DOM focus actually lands, and happy-dom will report focus on an
 * element a real browser refuses to focus.
 */
export const KeyboardNavigation: Story = {
  ...Default,
  play: async ({ canvasElement }) => {
    const tabs = within(canvasElement).getAllByRole("tab");
    await userEvent.click(tabs[0]!);
    await expect(tabs[0]!).toHaveFocus();

    await userEvent.keyboard("{ArrowRight}");
    await expect(tabs[1]!).toHaveFocus();
    await expect(tabs[1]!).toHaveAttribute("aria-selected", "true");

    // Wraps from the last tab back to the first.
    await userEvent.keyboard("{End}");
    await expect(tabs[tabs.length - 1]!).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(tabs[0]!).toHaveFocus();
  },
};

export const WithBadges: Story = {
  render: () => (
    <Tabs items={tabsWithBadge} defaultValue="details">
      <Tabs.List />
      <div className="mt-4">
        <Tabs.Panels />
      </div>
    </Tabs>
  ),
};

const tabsWithDisabled: TabItem[] = [
  { value: "details", label: "My details", content: <p>Details content</p> },
  { value: "profile", label: "Profile", content: <p>Profile content</p> },
  { value: "settings", label: "Settings", disabled: true, content: <p>Settings content</p> },
  { value: "billing", label: "Billing", content: <p>Billing content</p> },
];

export const WithDisabledTab: Story = {
  render: () => (
    <Tabs items={tabsWithDisabled} defaultValue="details">
      <Tabs.List />
      <div className="mt-4">
        <Tabs.Panels />
      </div>
    </Tabs>
  ),
};

export const Vertical: Story = {
  render: () => (
    <Tabs items={basicTabs} defaultValue="details">
      <div className="flex gap-4">
        <Tabs.List orientation="vertical" />
        <Tabs.Panels className="flex-1 rounded-md border border-border-normal p-4" />
      </div>
    </Tabs>
  ),
};

export const Controlled: Story = {
  render: function ControlledExample() {
    const [value, setValue] = useState("details");

    return (
      <div className="flex flex-col gap-4">
        <p className="text-fg-subtle text-sm">
          Selected tab: <strong>{value}</strong>
        </p>
        <Tabs items={basicTabs} value={value} onValueChange={setValue}>
          <Tabs.List />
          <div className="mt-4">
            <Tabs.Panels />
          </div>
        </Tabs>
      </div>
    );
  },
};

const richContentTabs: TabItem[] = [
  {
    value: "overview",
    label: "Overview",
    content: (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Project Overview</h3>
        <p className="text-fg-subtle">This is a comprehensive overview of the project, including key metrics, recent activity, and important updates.</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-md bg-bg-subtle p-4">
            <div className="font-bold text-2xl">128</div>
            <div className="text-fg-subtle text-sm">Total Tasks</div>
          </div>
          <div className="rounded-md bg-bg-subtle p-4">
            <div className="font-bold text-2xl">94</div>
            <div className="text-fg-subtle text-sm">Completed</div>
          </div>
          <div className="rounded-md bg-bg-subtle p-4">
            <div className="font-bold text-2xl">12</div>
            <div className="text-fg-subtle text-sm">In Progress</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    value: "activity",
    label: "Activity",
    badge: 5,
    content: (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Recent Activity</h3>
        <ul className="space-y-2">
          {["Task completed", "New comment", "File uploaded", "Member added", "Status changed"].map((item, i) => (
            <li key={i} className="flex items-center gap-2 rounded-md bg-bg-subtle p-2 text-sm">
              <span className="h-2 w-2 rounded-full bg-bg-brand" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    value: "settings",
    label: "Settings",
    content: (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Project Settings</h3>
        <p className="text-fg-subtle">Configure your project settings and preferences here.</p>
      </div>
    ),
  },
];

export const RichContent: Story = {
  render: () => (
    <div className="w-[500px]">
      <Tabs items={richContentTabs} defaultValue="overview">
        <Tabs.List />
        <div className="mt-4 rounded-md border border-border-normal p-4">
          <Tabs.Panels />
        </div>
      </Tabs>
    </div>
  ),
};

const lazyTabs: TabItem[] = [
  {
    value: "eager",
    label: "Eager",
    content: <p>This content is rendered immediately</p>,
  },
  {
    value: "lazy",
    label: "Lazy",
    content: () => {
      console.log("Lazy content rendered!");
      return <p>This content is rendered lazily when the tab is selected</p>;
    },
  },
];

export const LazyContent: Story = {
  render: () => (
    <div>
      <p className="mb-4 text-fg-subtle text-sm">Check the console to see when the lazy content is rendered.</p>
      <Tabs items={lazyTabs} defaultValue="eager">
        <Tabs.List />
        <div className="mt-4">
          <Tabs.Panels />
        </div>
      </Tabs>
    </div>
  ),
};

const manyTabs: TabItem[] = [
  { value: "tab1", label: "Dashboard", content: <p>Dashboard content</p> },
  { value: "tab2", label: "Analytics", content: <p>Analytics content</p> },
  { value: "tab3", label: "Reports", badge: 12, content: <p>Reports content</p> },
  { value: "tab4", label: "Users", content: <p>Users content</p> },
  { value: "tab5", label: "Products", content: <p>Products content</p> },
  { value: "tab6", label: "Orders", content: <p>Orders content</p> },
  { value: "tab7", label: "Inventory", content: <p>Inventory content</p> },
];

export const ManyTabs: Story = {
  render: () => (
    <Tabs items={manyTabs} defaultValue="tab1">
      <Tabs.List />
      <div className="mt-4">
        <Tabs.Panels />
      </div>
    </Tabs>
  ),
};

export const ComponentTokens = componentTokensStory("tabs-trigger");
