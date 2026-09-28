import { Badge } from "@sixthshift/design-system/badge";
import { Button } from "@sixthshift/design-system/button";
import { Checkbox } from "@sixthshift/design-system/checkbox";
import { Switch } from "@sixthshift/design-system/switch";
import { Toggle } from "@sixthshift/design-system/toggle";
import { ToggleGroup } from "@sixthshift/design-system/toggle-group";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { BRANDS } from "./brands";
import "./sample-brands.css";

/**
 * Scoped brands, rendered through the sample theme in ./sample-brands.css.
 *
 * Each story wraps itself in `data-brand="sea"`, standing in for the `:root`
 * default a real theme would declare: the sample stays off `:root` so it cannot
 * leak into other stories. The Theming page shows that file verbatim and links
 * here; ./scoped-brands.visual.test.tsx pins the screenshots and the contrast of
 * every brand pairing the sample declares.
 */
const meta = {
  title: "Design System/Scoped Brands",
  parameters: {
    docs: {
      description: {
        component: `One \`brand\` intent, any number of brands. A theme names its brands and
re-points every brand token inside an element carrying \`data-brand="<name>"\`;
components render that attribute from their \`brand\` prop and never learn the
names. See [Theming](?path=/docs/design-system-theming--docs#more-than-one-brand)
for the CSS.`,
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-wrap items-center gap-3">
    <code className="w-16 shrink-0 text-fg-subtle text-xs">{label}</code>
    {children}
  </div>
);

/** Every variant of the brand intent, per brand, set with the prop on each element. */
export const Brands: Story = {
  render: () => (
    <div data-brand="sea" className="flex flex-col gap-4">
      {BRANDS.map((brand) => (
        <Row key={brand} label={brand}>
          <Button intent="brand" brand={brand}>
            Solid
          </Button>
          <Button intent="brand" variant="outline" brand={brand}>
            Outline
          </Button>
          <Button intent="brand" variant="ghost" brand={brand}>
            Ghost
          </Button>
          <Button intent="brand" inline brand={brand}>
            Link
          </Button>
          <Button intent="brand" brand={brand} disabled>
            Disabled
          </Button>
          <Toggle intent="brand" variant="outline" brand={brand} defaultPressed aria-label={`Pressed ${brand} toggle`}>
            On
          </Toggle>
          <Badge intent="brand" brand={brand}>
            Solid
          </Badge>
          <Badge intent="brand" brand={brand} variant="soft">
            Soft
          </Badge>
          <Badge intent="brand" brand={brand} variant="outline">
            Outline
          </Badge>
        </Row>
      ))}
    </div>
  ),
};

/**
 * The scope on an ancestor: nothing inside the card names a brand, and
 * everything that reads a brand token follows it — including components with no
 * `brand` prop of their own.
 */
export const Scopes: Story = {
  render: () => (
    <div data-brand="sea" className="flex flex-col gap-4">
      <article data-brand="blush" data-testid="blush-card" className="flex flex-col gap-3 rounded-lg border border-border-brand bg-bg-brand-subtle p-4">
        <p className="font-medium text-fg-on-brand-subtle text-sm">A blush card</p>
        <Row label="inherits">
          <Button intent="brand">Add to cart</Button>
          <Badge intent="brand">New</Badge>
          <Checkbox label="Gift wrap" defaultChecked />
          <Switch label="Subscribe" defaultChecked />
          <ToggleGroup
            type="single"
            intent="brand"
            variant="outline"
            defaultValue="s"
            aria-label="Size"
            options={[
              { value: "s", label: "S" },
              { value: "m", label: "M" },
            ]}
          />
        </Row>
        <Row label="own">
          <Button intent="brand" brand="fern">
            Fern wins on its own element
          </Button>
        </Row>
        <Row label="reset">
          <Button intent="brand" brand="sea">
            Back to the default
          </Button>
        </Row>
        <Row label="unknown">
          <Button intent="brand" brand="bluhs">
            A typo inherits blush
          </Button>
        </Row>
      </article>
      <Row label="unknown">
        <Button intent="brand" brand="bluhs">
          At the top level it is the default
        </Button>
      </Row>
    </div>
  ),
};
