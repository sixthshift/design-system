import { withThemeByDataAttribute } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react-vite";

import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "./styles.css";

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: ["Design System", "Components", "*"],
      },
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
