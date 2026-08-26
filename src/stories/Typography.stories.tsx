import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Design System/Typography",
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj;

export const FontFamilies: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <p className="mb-2 text-fg-subtle text-sm">Sans — Inter Variable</p>
        <p className="text-4xl" style={{ fontFamily: "var(--font-sans)" }}>
          The quick brown fox jumps over the lazy dog
        </p>
        <p className="mt-2 text-lg" style={{ fontFamily: "var(--font-sans)" }}>
          ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
        </p>
      </div>
      <div>
        <p className="mb-2 text-fg-subtle text-sm">Mono — JetBrains Mono Variable</p>
        <p className="text-4xl" style={{ fontFamily: "var(--font-mono)" }}>
          The quick brown fox jumps over the lazy dog
        </p>
        <p className="mt-2 text-lg" style={{ fontFamily: "var(--font-mono)" }}>
          ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
        </p>
      </div>
    </div>
  ),
};

export const TypeScale: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-baseline gap-4">
        <span className="w-16 text-fg-subtle text-sm">xs</span>
        <span className="text-xs">The quick brown fox jumps over the lazy dog</span>
      </div>
      <div className="flex items-baseline gap-4">
        <span className="w-16 text-fg-subtle text-sm">sm</span>
        <span className="text-sm">The quick brown fox jumps over the lazy dog</span>
      </div>
      <div className="flex items-baseline gap-4">
        <span className="w-16 text-fg-subtle text-sm">base</span>
        <span className="text-base">The quick brown fox jumps over the lazy dog</span>
      </div>
      <div className="flex items-baseline gap-4">
        <span className="w-16 text-fg-subtle text-sm">lg</span>
        <span className="text-lg">The quick brown fox jumps over the lazy dog</span>
      </div>
      <div className="flex items-baseline gap-4">
        <span className="w-16 text-fg-subtle text-sm">xl</span>
        <span className="text-xl">The quick brown fox jumps over the lazy dog</span>
      </div>
      <div className="flex items-baseline gap-4">
        <span className="w-16 text-fg-subtle text-sm">2xl</span>
        <span className="text-2xl">The quick brown fox jumps over the lazy dog</span>
      </div>
      <div className="flex items-baseline gap-4">
        <span className="w-16 text-fg-subtle text-sm">3xl</span>
        <span className="text-3xl">The quick brown fox jumps over the lazy dog</span>
      </div>
      <div className="flex items-baseline gap-4">
        <span className="w-16 text-fg-subtle text-sm">4xl</span>
        <span className="text-4xl">The quick brown fox jumps over the lazy dog</span>
      </div>
    </div>
  ),
};

export const FontWeights: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-baseline gap-4">
        <span className="w-24 text-fg-subtle text-sm">normal</span>
        <span className="font-normal text-2xl">The quick brown fox jumps over the lazy dog</span>
      </div>
      <div className="flex items-baseline gap-4">
        <span className="w-24 text-fg-subtle text-sm">medium</span>
        <span className="font-medium text-2xl">The quick brown fox jumps over the lazy dog</span>
      </div>
      <div className="flex items-baseline gap-4">
        <span className="w-24 text-fg-subtle text-sm">semibold</span>
        <span className="font-semibold text-2xl">The quick brown fox jumps over the lazy dog</span>
      </div>
      <div className="flex items-baseline gap-4">
        <span className="w-24 text-fg-subtle text-sm">bold</span>
        <span className="font-bold text-2xl">The quick brown fox jumps over the lazy dog</span>
      </div>
    </div>
  ),
};

export const MonospaceShowcase: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-fg-subtle text-sm">Code Block</p>
        <pre className="rounded-lg bg-slate-900 p-4 text-slate-100" style={{ fontFamily: "var(--font-mono)" }}>
          {`function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

const result = greet("World");
console.log(result); // Hello, World!`}
        </pre>
      </div>
      <div>
        <p className="mb-2 text-fg-subtle text-sm">Inline Code</p>
        <p className="text-lg">
          Use the{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-900" style={{ fontFamily: "var(--font-mono)" }}>
            npm install
          </code>{" "}
          command to install dependencies.
        </p>
      </div>
      <div>
        <p className="mb-2 text-fg-subtle text-sm">Tabular Numbers</p>
        <div style={{ fontFamily: "var(--font-mono)" }} className="space-y-1 text-lg">
          <p>1,234.56</p>
          <p>12,345.67</p>
          <p>123,456.78</p>
        </div>
      </div>
    </div>
  ),
};

export const Hierarchy: Story = {
  render: () => (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-bold text-4xl">Page Title</h1>
      <h2 className="font-semibold text-2xl">Section Heading</h2>
      <h3 className="font-medium text-xl">Subsection</h3>
      <p className="text-base">
        Body text is the main content of a page. It should be easy to read at normal reading distances. The ideal line length is 50-75 characters for optimal
        readability.
      </p>
      <p className="text-fg-subtle text-sm">
        Secondary text provides supporting information. It uses a smaller size and muted color to create visual hierarchy without competing with the primary
        content.
      </p>
      <p className="text-fg-subtle text-xs">Caption or fine print. Used for legal text, timestamps, or other metadata.</p>
    </div>
  ),
};
