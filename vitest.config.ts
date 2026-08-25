import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import { configDefaults, defineConfig } from "vitest/config";

const dirname = typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// Pre-bundle the React runtime for the browser-mode projects. If Vite discovers
// one of these mid-run it re-optimizes and reloads the page, which swaps the
// React module instance — every in-flight render then hits a null dispatcher and
// throws "Cannot read properties of null (reading 'useState')". Those surface as
// unhandled errors while tests still report as passing, so pin them up front.
const BROWSER_OPTIMIZE_DEPS = ["react", "react-dom", "react-dom/client", "react/jsx-runtime", "react/jsx-dev-runtime"];

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  test: {
    projects: [
      // Unit tests with happy-dom (3-5× faster setup than jsdom)
      {
        extends: true,
        test: {
          name: "unit",
          include: ["src/**/*.test.{ts,tsx}"],
          // *.visual.test.tsx also ends in .test.tsx — it belongs to the
          // browser-mode "visual" project, not here.
          exclude: [...configDefaults.exclude, "src/temporal/**", "src/**/*.visual.test.tsx"],
          environment: "happy-dom",
          setupFiles: ["./vitest.setup.ts"],
          isolate: false,
        },
      },
      // Pure date/time utilities — Node env, no DOM, explicit vitest imports
      {
        extends: true,
        test: {
          name: "temporal",
          include: ["src/temporal/**/*.test.ts"],
          environment: "node",
          globals: false,
          isolate: false,
        },
      },
      // Visual regression — real Chromium, screenshots diffed against committed
      // baselines. Stories are the fixtures (see *.visual.test.tsx).
      {
        extends: true,
        plugins: [tailwindcss()],
        optimizeDeps: { include: [...BROWSER_OPTIMIZE_DEPS, "@testing-library/react"] },
        test: {
          name: "visual",
          include: ["src/**/*.visual.test.tsx"],
          setupFiles: ["./vitest.setup.visual.ts"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
            viewport: { width: 1280, height: 720 },
            expect: {
              toMatchScreenshot: {
                comparatorName: "pixelmatch",
                // A handful of pixels of antialiasing drift is not a regression.
                // Keep this tight: it is also the knob that hides real changes.
                comparatorOptions: { allowedMismatchedPixelRatio: 0.01 },
                // The default path ends in `-${platform}`, but platform is
                // process.platform — "linux" on both arm64 and x64. Baselines
                // from an arm64 devcontainer would silently collide with x64
                // CI, so key them by architecture as well.
                resolveScreenshotPath: ({ root, testFileDirectory, screenshotDirectory, testFileName, arg, browserName, platform, ext }) =>
                  `${root}/${testFileDirectory}/${screenshotDirectory}/${testFileName}/${arg}-${browserName}-${platform}-${process.arch}${ext}`,
              },
            },
          },
        },
      },
      // Storybook smoke + a11y tests
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, ".storybook") }),
        ],
        optimizeDeps: { include: BROWSER_OPTIMIZE_DEPS },
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
          setupFiles: [".storybook/vitest.setup.ts"],
        },
      },
    ],
  },
});
