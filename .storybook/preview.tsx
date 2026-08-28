import { withThemeByDataAttribute } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react-vite";
import { DocsPage } from "./DocsPage";

import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "./styles.css";

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: ["Overview", "Design System", "Components", "*"],
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

  decorators: [
    withThemeByDataAttribute({
      themes: {
        light: "light",
        dark: "dark",
      },
      defaultTheme: "light",
      attributeName: "data-theme",
    }),
  ],
};

export default preview;
