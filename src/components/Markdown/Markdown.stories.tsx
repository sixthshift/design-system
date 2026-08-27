import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { Markdown } from "./Markdown";

const meta: Meta<typeof Markdown> = {
  title: "Components/Markdown",
  component: Markdown,
  parameters: {
    layout: "centered",
    docs: { subtitle: "Chat-style markdown rendered through the typography components" },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[32rem]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Markdown>;

/**
 * Markdown becomes real elements, not escaped text — asserted by role, so a
 * heading has to actually be a heading.
 */
export const RenderingPlay: Story = {
  render: () => <Markdown>{"## A heading\n\nSome **bold** text and a [link](https://example.com).\n\n- one\n- two"}</Markdown>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("heading", { name: "A heading" })).toBeInTheDocument();
    await expect(canvas.getByRole("link", { name: "link" })).toHaveAttribute("href", "https://example.com");
    await expect(canvas.getAllByRole("listitem")).toHaveLength(2);
    await expect(canvas.getByText("bold").tagName).toBe("STRONG");
  },
};

export const Default: Story = {
  args: {
    children: `Your calendar is clear this afternoon. The **project review** moved to Thursday, so you have a free block from 2pm onward.

You could use it to close out the two remaining tasks from this week.`,
  },
};

export const Headings: Story = {
  args: {
    children: `# Heading one renders as h3

Body copy under the largest heading.

## Heading two renders as h4

Body copy under the second-level heading.

### Heading three renders as emphasis

Body copy under the third-level heading.`,
  },
};

export const Lists: Story = {
  args: {
    children: `Unordered:

- Reply to the contractor about quotes
- Book dentist appointment
- Review insurance renewal

Ordered:

1. Export the data
2. Run the migration
3. Verify row counts`,
  },
};

export const Code: Story = {
  args: {
    children: `Inline code like \`bun run test\` sits within a sentence.

Block code gets its own panel:

\`\`\`
SELECT domain, count(*)
FROM entities
GROUP BY domain
ORDER BY count DESC;
\`\`\``,
  },
};

export const Links: Story = {
  args: {
    children: `See the [weekly review](https://example.com/review) for details, or jump straight to [open tasks](https://example.com/tasks).`,
  },
};

export const FormattingReference: Story = {
  args: {
    children: `# Document title

An intro paragraph with **bold**, *italic*, and \`inline code\`, plus a [link](https://example.com).

## Section

- First point
- Second point with **emphasis**

### Subsection

1. Step one
2. Step two

\`\`\`
{ "key": "value" }
\`\`\`

A closing paragraph after the code block.`,
  },
};
