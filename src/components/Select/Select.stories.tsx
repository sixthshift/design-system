import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, screen, userEvent, within } from "storybook/test";
import { componentTokensStory } from "../../stories/recipes/componentTokensStory";
import { Select } from "./Select";

const meta: Meta<typeof Select> = {
  title: "Components/Select",
  component: Select,
  parameters: {
    docs: {
      subtitle: "A single- or multi-value dropdown with keyboard navigation and optional search",
      description: {
        component: `Single- or multi-select dropdown, switched by \`mode\`: \`"single"\` (default)
commits one value, \`"multiple"\` an array. \`value\`/\`defaultValue\`/
\`onValueChange\` follow whichever mode is active (\`useControllableState\`).

Keyboard handling (\`useSelectKeyboard\`) covers ArrowDown/ArrowUp to move the
highlighted option, Home/End to jump to the first/last, Enter — and Space
when not \`searchable\` — to select it, Escape to close (or, with a search
value present, to clear it first), and, when not \`searchable\`, typing a
letter to jump to the next option starting with it. With \`searchable\`, the
trigger becomes a text input (\`role="combobox"\`) and typing filters the
list instead of matching letters. The highlighted option is tracked via
\`aria-activedescendant\` rather than DOM focus, so focus stays on the
listbox (or the search input) the whole time it's open. The dropdown itself
renders \`role="listbox"\` with \`role="option"\`/\`aria-selected\` items.

\`collapsed\` abbreviates the trigger to the value's first letter with a
\`title\` tooltip, and disables opening entirely — clicks and keyboard both
no-op. \`clearable\` adds a clear button beside the trigger, not inside it,
since nesting two interactive controls would be invalid and unreachable by
assistive tech.

Composed from \`SelectTriggerButton\`/\`SelectTriggerSearch\` and
\`SelectDropdown\`. \`forwardRef\` erases the generic, so the implementation
takes the ref as an ordinary second argument and this export re-declares
the generic signature over it — consumers keep \`Select<"a" | "b">\`
inference *and* get a ref. The ref lands on the trigger's root \`<div>\`,
which is swapped (not mutated) when \`searchable\` toggles between the
button and search triggers.`,
      },
    },
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    collapsed: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
    searchable: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

const defaultOptions = [
  { value: "all", label: "All" },
  { value: "personal", label: "Personal" },
  { value: "work", label: "Work" },
];

// Controlled wrapper for interactive stories
const SelectWrapper = (props: { collapsed?: boolean; disabled?: boolean; searchable?: boolean; clearable?: boolean; placeholder?: string }) => {
  const [value, setValue] = useState("all");
  return (
    <div className="w-48">
      <Select value={value} options={defaultOptions} onValueChange={setValue} {...props} />
    </div>
  );
};

/**
 * Opened by the play function. The closed trigger is a plain button; every rule
 * that matters here — the listbox's name, `aria-activedescendant`, the options'
 * contrast — only exists once the dropdown is on the page.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button"));
    const listbox = await screen.findByRole("listbox");
    await expect(listbox).toHaveAttribute("aria-activedescendant", screen.getByRole("option", { name: "All" }).id);
  },
  render: () => <SelectWrapper />,
};

export const WithPlaceholder: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div className="w-48">
        <Select value={value} options={defaultOptions} onValueChange={setValue} placeholder="Select a space..." />
      </div>
    );
  },
};

export const Collapsed: Story = {
  render: () => <SelectWrapper collapsed />,
};

export const Disabled: Story = {
  render: () => <SelectWrapper disabled />,
};

export const ManyOptions: Story = {
  render: () => {
    const [value, setValue] = useState("jan");
    const months = [
      { value: "jan", label: "January" },
      { value: "feb", label: "February" },
      { value: "mar", label: "March" },
      { value: "apr", label: "April" },
      { value: "may", label: "May" },
      { value: "jun", label: "June" },
      { value: "jul", label: "July" },
      { value: "aug", label: "August" },
      { value: "sep", label: "September" },
      { value: "oct", label: "October" },
      { value: "nov", label: "November" },
      { value: "dec", label: "December" },
    ];
    return (
      <div className="w-48">
        <Select value={value} options={months} onValueChange={setValue} />
      </div>
    );
  },
};

export const InContext: Story = {
  render: () => {
    const [space, setSpace] = useState("all");
    const [view, setView] = useState("week");

    const viewOptions = [
      { value: "day", label: "Day" },
      { value: "week", label: "Week" },
      { value: "month", label: "Month" },
    ];

    return (
      <div className="flex items-center gap-4">
        <div className="w-32">
          <Select value={space} options={defaultOptions} onValueChange={setSpace} />
        </div>
        <div className="w-28">
          <Select value={view} options={viewOptions} onValueChange={setView} />
        </div>
      </div>
    );
  },
};

export const Clearable: Story = {
  render: () => {
    const [value, setValue] = useState("all");
    return (
      <div className="w-48">
        <Select value={value} options={defaultOptions} onValueChange={setValue} clearable />
      </div>
    );
  },
};

export const Searchable: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button"));
    // The trigger becomes a combobox input, which keeps focus and owns the
    // active-option pointer.
    await expect(await screen.findByRole("combobox")).toHaveFocus();
    await expect(await screen.findByRole("listbox")).toBeInTheDocument();
  },
  render: () => {
    const [value, setValue] = useState("jan");
    const months = [
      { value: "jan", label: "January" },
      { value: "feb", label: "February" },
      { value: "mar", label: "March" },
      { value: "apr", label: "April" },
      { value: "may", label: "May" },
      { value: "jun", label: "June" },
      { value: "jul", label: "July" },
      { value: "aug", label: "August" },
      { value: "sep", label: "September" },
      { value: "oct", label: "October" },
      { value: "nov", label: "November" },
      { value: "dec", label: "December" },
    ];
    return (
      <div className="w-48">
        <Select value={value} options={months} onValueChange={setValue} searchable />
      </div>
    );
  },
};

export const SearchableManyOptions: Story = {
  render: () => {
    const [value, setValue] = useState("us");
    const countries = [
      { value: "us", label: "United States" },
      { value: "uk", label: "United Kingdom" },
      { value: "ca", label: "Canada" },
      { value: "au", label: "Australia" },
      { value: "de", label: "Germany" },
      { value: "fr", label: "France" },
      { value: "it", label: "Italy" },
      { value: "es", label: "Spain" },
      { value: "nl", label: "Netherlands" },
      { value: "be", label: "Belgium" },
      { value: "ch", label: "Switzerland" },
      { value: "at", label: "Austria" },
      { value: "se", label: "Sweden" },
      { value: "no", label: "Norway" },
      { value: "dk", label: "Denmark" },
      { value: "fi", label: "Finland" },
      { value: "pl", label: "Poland" },
      { value: "ie", label: "Ireland" },
      { value: "nz", label: "New Zealand" },
      { value: "sg", label: "Singapore" },
      { value: "jp", label: "Japan" },
      { value: "kr", label: "South Korea" },
      { value: "in", label: "India" },
      { value: "cn", label: "China" },
      { value: "br", label: "Brazil" },
      { value: "mx", label: "Mexico" },
      { value: "ar", label: "Argentina" },
      { value: "za", label: "South Africa" },
    ];
    return (
      <div className="w-64">
        <Select value={value} options={countries} onValueChange={setValue} searchable />
      </div>
    );
  },
};

// =============================================================================
// Multiple mode
// =============================================================================

const tagOptions = [
  { value: "work", label: "Work" },
  { value: "personal", label: "Personal" },
  { value: "urgent", label: "Urgent" },
  { value: "followup", label: "Follow-up" },
  { value: "waiting", label: "Waiting" },
];

export const Multiple: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button"));
    await expect(await screen.findByRole("listbox")).toHaveAttribute("aria-multiselectable", "true");
  },
  render: () => {
    const [value, setValue] = useState<string[]>(["work"]);
    return (
      <div className="w-48">
        <Select mode="multiple" value={value} options={tagOptions} onValueChange={setValue} />
      </div>
    );
  },
};

export const MultipleEmpty: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <div className="w-48">
        <Select mode="multiple" value={value} options={tagOptions} onValueChange={setValue} placeholder="Select tags..." />
      </div>
    );
  },
};

export const MultipleClearable: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(["work", "urgent"]);
    return (
      <div className="w-48">
        <Select mode="multiple" value={value} options={tagOptions} onValueChange={setValue} clearable />
      </div>
    );
  },
};

export const MultipleSearchable: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    const countries = [
      { value: "us", label: "United States" },
      { value: "uk", label: "United Kingdom" },
      { value: "ca", label: "Canada" },
      { value: "au", label: "Australia" },
      { value: "de", label: "Germany" },
      { value: "fr", label: "France" },
      { value: "it", label: "Italy" },
      { value: "es", label: "Spain" },
      { value: "jp", label: "Japan" },
      { value: "kr", label: "South Korea" },
      { value: "br", label: "Brazil" },
      { value: "mx", label: "Mexico" },
    ];
    return (
      <div className="w-64">
        <Select mode="multiple" value={value} options={countries} onValueChange={setValue} searchable placeholder="Select countries..." />
      </div>
    );
  },
};

export const MultipleDisabled: Story = {
  render: () => (
    <div className="w-48">
      <Select mode="multiple" value={["work", "urgent"]} options={tagOptions} disabled />
    </div>
  ),
};

export const ComponentTokens = componentTokensStory("select-trigger", "select-trigger-clear", "select-dropdown", "select-option", "select-option-indicator");
