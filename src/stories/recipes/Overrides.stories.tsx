import { Button } from "@sixthshift/design-system/button";
import { Heading } from "@sixthshift/design-system/heading";
import { Text } from "@sixthshift/design-system/text";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * What tier 3 buys a consumer, shown rather than described.
 *
 * Every demo here works the way a consumer's stylesheet works — a real CSS rule
 * setting a component token — rather than an inline `style`, because the point
 * being made is about the cascade. Inline styles would win for a different
 * reason and teach the wrong lesson.
 */
const meta: Meta = {
  title: "Design System/Component Tokens/Overrides",
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj;

const SEMANTIC_BG = ["bg-brand", "bg-brand-strong", "bg-strong", "bg-success", "bg-warning", "bg-danger", "bg-subtle"];
const SEMANTIC_FG = ["fg-on-brand", "fg-on-strong", "fg-on-success", "fg-on-warning", "fg-on-danger", "fg-normal"];

function Snippet({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-md border border-border-normal bg-bg-subtle p-3 font-mono text-fg-normal text-xs">
      <code>{children}</code>
    </pre>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <Text as="p" className="max-w-3xl text-fg-subtle">
      {children}
    </Text>
  );
}

// ---------------------------------------------------------------------------

type RewireArgs = { bg: string; fg: string; hovered: string };

/**
 * Re-point one cell. The library ships `solid`/`neutral` as brand-coloured — an
 * opinion that, before this layer, a consumer could only escape by repainting
 * `--bg-brand` globally and dragging every other brand surface along with it.
 */
export const RewireACell: StoryObj<RewireArgs> = {
  args: { bg: "bg-strong", fg: "fg-on-strong", hovered: "bg-strong-hovered" },
  argTypes: {
    bg: { control: "select", options: SEMANTIC_BG, name: "--button-bg" },
    fg: { control: "select", options: SEMANTIC_FG, name: "--button-fg" },
    hovered: { control: "select", options: SEMANTIC_BG.map((t) => `${t}-hovered`), name: "--button-bg-hovered" },
  },
  render: ({ bg, fg, hovered }) => {
    const css = `.btn[data-variant="solid"][data-intent="neutral"] {
  --button-bg: var(--${bg});
  --button-fg: var(--${fg});
  --button-bg-hovered: var(--${hovered});
}`;
    return (
      <div className="flex flex-col gap-4">
        <Heading as="h2">Re-point a cell</Heading>
        <Note>
          The rule below is scoped to this demo so the rest of the page keeps the shipped values. Drop the same rule unscoped into your stylesheet and it
          applies app-wide. Hover the right-hand button to see <code className="font-mono text-xs">--button-bg-hovered</code> take effect.
        </Note>
        <style>{`.rewire-demo ${css}`}</style>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col items-start gap-2">
            <Text as="span" className="text-fg-subtle text-xs">
              as shipped
            </Text>
            <Button>Continue</Button>
          </div>
          <div className="rewire-demo flex flex-col items-start gap-2">
            <Text as="span" className="text-fg-subtle text-xs">
              re-pointed
            </Text>
            <Button>Continue</Button>
          </div>
        </div>
        <Snippet>{css}</Snippet>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------

/**
 * The demo that matters most: an intent the library has never heard of. Nothing
 * here is a library change — two CSS blocks and a prop value.
 */
export const AddAnIntent: Story = {
  render: () => {
    const css = `/* 1. the semantic tokens, in both modes */
:root:not([data-theme]),
:root[data-theme="light"] { --bg-info: var(--color-ocean-700); --fg-on-info: #ffffff; }
:root[data-theme="dark"]  { --bg-info: var(--color-ocean-400); --fg-on-info: #06121f; }

/* 2. the recipe cell */
.btn[data-variant="solid"][data-intent="info"] {
  --button-bg: var(--bg-info);
  --button-fg: var(--fg-on-info);
}`;
    return (
      <div className="flex flex-col gap-4">
        <style>{css}</style>
        <Heading as="h2">Add an intent that was never shipped</Heading>
        <Note>
          <code className="font-mono text-xs">intent</code> is typed as the shipped union <em>plus</em> <code className="font-mono text-xs">string</code>, so{" "}
          <code className="font-mono text-xs">intent="info"</code> type-checks. No <code className="font-mono text-xs">@theme</code> entry is needed either —
          recipes read <code className="font-mono text-xs">var(--bg-info)</code> as plain CSS, never through a Tailwind utility. Switch the Storybook theme to
          confirm it tracks light and dark.
        </Note>
        <div className="flex flex-wrap items-center gap-3">
          <Button intent="neutral">Neutral</Button>
          <Button intent="success">Success</Button>
          <Button intent="danger">Danger</Button>
          <Button intent="info">Info — added by the consumer</Button>
        </div>
        <Snippet>{css}</Snippet>
        <Note>
          You own the contrast of tokens you add: <code className="font-mono text-xs">bun run check:contrast</code> only sees the library's own pairings.
        </Note>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------

/**
 * Scoping is the capability a token *value* can never have: `--bg-brand` is
 * global by construction, so "buttons are different in checkout" was previously
 * a per-call-site `className` on every button in that route.
 */
export const ScopeToASubtree: Story = {
  render: () => {
    const css = `.checkout .btn[data-variant="solid"][data-intent="neutral"] {
  --button-bg: var(--bg-success);
  --button-fg: var(--fg-on-success);
  --button-bg-hovered: var(--bg-success-hovered);
}`;
    return (
      <div className="flex flex-col gap-4">
        <style>{css}</style>
        <Heading as="h2">Scope it to a subtree</Heading>
        <Note>
          Same component, same props, same bundle — the only difference is an ancestor. Two tenants, two routes or two brands can diverge without a second
          build.
        </Note>
        <div className="flex flex-wrap gap-6">
          <div className="flex flex-col items-start gap-2 rounded-lg border border-border-normal p-4">
            <Text as="span" className="text-fg-subtle text-xs">
              anywhere else
            </Text>
            <Button>Place order</Button>
          </div>
          <div className="checkout flex flex-col items-start gap-2 rounded-lg border border-border-normal p-4">
            <Text as="span" className="text-fg-subtle text-xs">
              inside <code className="font-mono">.checkout</code>
            </Text>
            <Button>Place order</Button>
          </div>
        </div>
        <Snippet>{css}</Snippet>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------

/**
 * The failure mode worth documenting, because it is silent and the fix is
 * counter-intuitive: the *lower* specificity rule is the one that works.
 */
export const TheLayeringTrap: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <style>{`
        .trap-good .btn { --button-bg: var(--bg-success); --button-fg: var(--fg-on-success); }
        @layer components { .trap-bad .btn { --button-bg: var(--bg-success); --button-fg: var(--fg-on-success); } }
      `}</style>
      <Heading as="h2">Write overrides unlayered</Heading>
      <Note>
        Both rules below are identical apart from one being wrapped in <code className="font-mono text-xs">@layer components</code>. The cascade compares layers
        before specificity, so unlayered author CSS beats the library's layered rules — and a rule nested into the library's own layer loses to it on
        specificity instead, silently, on every cell the library ships.
      </Note>
      <div className="flex flex-wrap gap-6">
        <div className="trap-good flex flex-col items-start gap-2 rounded-lg border border-border-normal p-4">
          <Text as="span" className="text-fg-subtle text-xs">
            unlayered — wins
          </Text>
          <Button>Save</Button>
        </div>
        <div className="trap-bad flex flex-col items-start gap-2 rounded-lg border border-border-normal p-4">
          <Text as="span" className="text-fg-subtle text-xs">
            inside @layer components — silently ignored
          </Text>
          <Button>Save</Button>
        </div>
      </div>
      <Snippet>{`/* works */
.app .btn { --button-bg: var(--bg-success); }

/* silently does nothing on any cell the library ships */
@layer components {
  .app .btn { --button-bg: var(--bg-success); }
}`}</Snippet>
    </div>
  ),
};
