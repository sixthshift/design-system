import * as a11yAddonAnnotations from "@storybook/addon-a11y/preview";
import { setProjectAnnotations } from "@storybook/react-vite";
import * as projectAnnotations from "./preview";
import { withThemeAttribute } from "./theme-attribute";

// This is an important step to apply the right configuration when testing your stories.
// More info at: https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest#setprojectannotations
setProjectAnnotations([
  a11yAddonAnnotations,
  projectAnnotations,
  // The light half of the palette. Explicit rather than implied by the absence
  // of the attribute — see .storybook/theme-attribute.ts.
  { initialGlobals: { theme: "light" }, decorators: [withThemeAttribute] },
]);
