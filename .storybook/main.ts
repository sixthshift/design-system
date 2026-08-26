import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";
import { sourceAliases } from "../scripts/source-aliases";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): string {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  viteFinal: async (config) => {
    const { default: tailwindcss } = await import("@tailwindcss/vite");
    config.plugins = [...(config.plugins || []), tailwindcss()];
    // Resolve the package's own subpath imports to `src/` rather than to the
    // compiled `dist/` the `exports` map points at — stories must render the
    // working tree. See scripts/source-aliases.ts. Vite accepts either form of
    // `alias`, so normalise to the array form instead of assuming an object.
    const existing = config.resolve?.alias;
    const inherited = Array.isArray(existing) ? existing : Object.entries(existing ?? {}).map(([find, replacement]) => ({ find, replacement }));
    config.resolve = {
      ...config.resolve,
      alias: [...inherited, ...Object.entries(sourceAliases()).map(([find, replacement]) => ({ find, replacement }))],
    };
    return config;
  },
  addons: [
    getAbsolutePath("@storybook/addon-vitest"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-docs"),
    getAbsolutePath("@storybook/addon-themes"),
  ],
  framework: getAbsolutePath("@storybook/react-vite"),
};
export default config;
