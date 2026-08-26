import * as a11yAddonAnnotations from "@storybook/addon-a11y/preview";
import { setProjectAnnotations } from "@storybook/react-vite";
import * as projectAnnotations from "./preview";
import { withThemeAttribute } from "./theme-attribute";

/**
 * The same stories, rendered in the dark theme.
 *
 * `preview.tsx` sets `defaultTheme: "light"`, so every axe run only ever saw the
 * light palette — half the design system's colours were never checked, and dark
 * mode is where contrast regressions hide: a token that clears 4.5:1 on white
 * can fall under it on near-black.
 */
setProjectAnnotations([a11yAddonAnnotations, projectAnnotations, { initialGlobals: { theme: "dark" }, decorators: [withThemeAttribute] }]);
