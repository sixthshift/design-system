# @sixthshift/ui

Personal design system component library built on [shadcn/ui](https://ui.shadcn.com) patterns.

## Orientation

**Owns:** The component library: 80+ exports via subpath imports (`@sixthshift/ui/button`, `@sixthshift/ui/modal`, etc.), design tokens, theme system (JSON-driven CSS generation), Tailwind config, and Storybook stories. Components span primitives, composites, typography, charts, and overlays.

**Boundaries:** Depends on `@sixthshift/temporal` (date/time components), Floating UI (popover/tooltip positioning), and CVA (variant styling). Peer-depends on React 18. No app/domain coupling — domain-specific components live in consuming apps.

**Surprise:** All components are imported via subpath exports (`@sixthshift/ui/button`), never from a barrel root -- there is no main export. Positioning uses Floating UI, not Radix. Variants use the `variant` (visual) + `intent` (semantic) orthogonal prop pattern via CVA, not className-based styling. Compound components (e.g., Tabs) use `Object.assign` to attach sub-components. Check `src/components/` before creating any new UI element.

## Usage

```tsx
// 1. Import the styles (once, in your app entry)
import '@sixthshift/ui/theme.css';   // CSS variables (light/dark via data-theme)
import '@sixthshift/ui/styles.css';  // Compiled Tailwind + base styles

// 2. Import components via subpaths
import { Button } from '@sixthshift/ui/button';
import { Card } from '@sixthshift/ui/card';
import { Badge } from '@sixthshift/ui/badge';

<Card title="Bills Due" headerAction={<Button size="sm">View All</Button>}>
  <Badge intent="warning">3 pending</Badge>
  <Button intent="success">Mark Paid</Button>
</Card>
```

## Available Exports

```tsx
// Primitives (Button, Badge, Card, Input, Textarea, Checkbox, Switch, Avatar, etc.)
import { Button } from '@sixthshift/ui/button';
import { Input } from '@sixthshift/ui/input';

// Composites (FormField, NavSide, Tabs, Pagination, etc.)
import { FormField } from '@sixthshift/ui/form-field';

// Charts (LineChart, BarChart, Sparkline, HeatMap)
import { LineChart } from '@sixthshift/ui/line-chart';

// Pickers (Calendar, DatePicker, TimePicker, DateTimePicker, DateTimeRangePicker)
import { DatePicker } from '@sixthshift/ui/date-picker';

// Overlays (Modal, Sheet, Toast, Tooltip, Popover, HoverCard)
import { Modal } from '@sixthshift/ui/modal';

// Typography (Heading, SectionTitle, Caption, Code, Lead, etc.)
import { Heading } from '@sixthshift/ui/heading';

// Utilities
import { cn } from '@sixthshift/ui/utils';
import { useTheme, useLocalStorage } from '@sixthshift/ui/hooks';
```

## Component API

Components use two orthogonal props:

- **`variant`**: Visual treatment (how it looks) — `solid`, `outline`, `ghost`, `link`
- **`intent`**: Semantic meaning (what it means) — `neutral`, `danger`, `success`, `warning`

```tsx
<Button variant="solid" intent="danger">Delete</Button>
<Button variant="outline" intent="success">Approve</Button>
<Badge variant="soft" intent="warning">Pending</Badge>
```

See [docs/design-tokens.md](../../docs/design-tokens.md) for the full token reference.

## Tailwind Integration

If your app uses Tailwind and you want to extend the theme:

```ts
// tailwind.config.ts
import uiConfig from '@sixthshift/ui/tailwind.config';

export default {
  presets: [uiConfig],
  content: [
    './src/**/*.{ts,tsx}',
    './node_modules/@sixthshift/ui/src/**/*.{ts,tsx}',
  ],
};
```

## Development

```bash
# Run Storybook
bun run storybook

# Build theme CSS + compiled Tailwind (also runs on postinstall)
bun run build

# Type check
bun run type-check
```

## Structure

```
src/
├── components/   # One directory per component (Button/, Modal/, DatePicker/, ...)
├── typography/   # Typography presets (Heading, Caption, etc.)
├── hooks/        # React hooks (useTheme, useLocalStorage, useControllableState, ...)
├── internal/     # Internal-only primitives (Slot)
├── theme/        # Token JSONs + schemas + generator types
├── styles/       # Tailwind entry (base.css)
├── stories/      # Design-system doc stories (palette, theme)
└── lib/          # Utilities (cn, format, boundaries, overlay/components contexts)
```
