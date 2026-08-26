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
          // scripts/ is build tooling, but next-version.ts decides published
          // version numbers, so it is covered here too.
          include: ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.ts"],
          // *.visual.test.tsx also ends in .test.tsx — it belongs to the
          // browser-mode "visual" project, not here.
          exclude: [...configDefaults.exclude, "src/date-time/**", "src/**/*.visual.test.tsx"],
          environment: "happy-dom",
          setupFiles: ["./vitest.setup.ts"],
          isolate: false,
        },
      },
      // Pure date/time utilities — Node env, no DOM, explicit vitest imports
      {
        extends: true,
        test: {
          name: "date-time",
          include: ["src/date-time/**/*.test.ts"],
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
            provider: playwright({
              contextOptions: {
                // Their own Tailwind base layer pins every animation and
                // transition to 0.01ms under this query, so the design system
                // does most of the freezing for us.
                reducedMotion: "reduce",
                // Pin everything a screenshot can depend on rather than
                // inheriting whatever the machine happens to default to.
                deviceScaleFactor: 1,
                colorScheme: "light",
                timezoneId: "UTC",
                locale: "en-US",
              },
            }),
            instances: [{ browser: "chromium" }],
            viewport: { width: 1280, height: 720 },
            expect: {
              toMatchScreenshot: {
                comparatorName: "pixelmatch",
                // Zero, deliberately. With motion frozen, fonts pre-loaded, a
                // fixed frame width and CI on the same architecture, rendering is
                // bit-identical run to run. Measured: 1% left ~620 pixels of
                // slack and even 0.1% still absorbed a 12px -> 8px corner radius
                // change (~0.06% of the frame). Any tolerance here is a blind
                // spot, not safety. A Chromium bump will fail the suite, which is
                // the correct prompt to review and re-record baselines.
                comparatorOptions: { allowedMismatchedPixelRatio: 0 },
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
          // 57 story files in one browser exhausted memory and killed Chromium
          // mid-run ("Browser connection was closed"), which truncated the run
          // while still reporting success. Serialising trades wall-clock for a
          // result you can trust — and CI runners are smaller than a dev box.
          fileParallelism: false,
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
