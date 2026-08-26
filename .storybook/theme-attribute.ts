import type { Decorator } from "@storybook/react-vite";

/**
 * Stamps `data-theme` on `<html>` for the vitest story runs.
 *
 * `withThemeByDataAttribute` (preview.tsx) does this through `useEffect` from
 * `storybook/preview-api` — a story-level effect the browser preview flushes but
 * the portable-stories runner never does. So under vitest the attribute was
 * simply never set: `:root[data-theme="dark"]` in tokens.css never matched, and
 * axe only ever saw the fallback light palette. Setting it here, from the same
 * `theme` global the toolbar drives, is what makes a dark-theme test project
 * mean anything.
 *
 * Applied during render rather than in an effect so the attribute is in place
 * before the a11y check reads computed colours.
 */
export const withThemeAttribute: Decorator = (storyFn, context) => {
  const theme = typeof context.globals.theme === "string" ? context.globals.theme : "light";
  document.documentElement.setAttribute("data-theme", theme);
  return storyFn();
};
