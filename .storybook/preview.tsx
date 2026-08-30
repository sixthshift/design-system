import { withThemeByDataAttribute } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react-vite";
import { DocsPage } from "./DocsPage";
import { applyThemeVariant } from "./theme-preview";

import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "./styles.css";

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        // Everything that is not a component lives under Design System, in
        // reading order: Overview orients, Theming is the how-to, and the token
        // pages after it are the reference those two point into.
        order: ["Design System", ["Overview", "Theming", "Theme", ["Colors", ["Semantic", "Palette"]], "Typography", "Kitchen Sink", "*"], "Components", "*"],
      },
    },

    docs: {
      // One layout for every component — see DocsPage.tsx for why this is not
      // fifty-three MDX files. A component can still override it with its own
      // attached MDX page.
      page: DocsPage,
    },

    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'error' - fail CI on a11y violations (the backlog is clear; keep it that way)
      // 'todo'  - report violations in the test UI only
      // 'off'   - skip a11y checks entirely
      test: "error",
    },
  },

  // Alternative themes (src/theme/<name>/, exported as ./themes/<name>.css).
  // A consumer imports exactly one, so the preview injects the chosen theme's
  // variables at runtime instead — see theme-preview.ts. "Default" restores
  // the shipped default theme; every story renders under any theme unchanged.
  globalTypes: {
    palette: {
      description: "Alternative theme (plans/10 palette explorations)",
      toolbar: {
        title: "Palette",
        icon: "paintbrush",
        dynamicTitle: true,
        items: [
          { value: "", title: "Default palette" },
          { value: "ink-led", title: "01 Ink-led" },
          { value: "hue-anchored", title: "02 Hue-anchored" },
          { value: "contrast-locked", title: "03 Contrast-locked" },
          { value: "seeded", title: "04 Seeded" },
          { value: "muted-workhorse", title: "05 Muted workhorse" },
          { value: "expressive", title: "06 Expressive" },
        ],
      },
    },
  },
  initialGlobals: {
    palette: "",
  },

  decorators: [
    withThemeByDataAttribute({
      themes: {
        light: "light",
        dark: "dark",
      },
      defaultTheme: "light",
      attributeName: "data-theme",
    }),
    // Injected document-wide (not on the story root): overlays portal to
    // document.body and must pick the theme up too.
    (Story, context) => {
      applyThemeVariant(context.globals.palette as string | undefined);
      return <Story />;
    },
  ],
};

export default preview;
