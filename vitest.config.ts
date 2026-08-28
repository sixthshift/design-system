import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import { configDefaults, defineConfig } from "vitest/config";
import { sourceAliases } from "./scripts/source-aliases";

const dirname = typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// Pre-bundle the React runtime for the browser-mode projects. If Vite discovers
// one of these mid-run it re-optimizes and reloads the page, which swaps the
// React module instance — every in-flight render then hits a null dispatcher and
// throws "Cannot read properties of null (reading 'useState')". Those surface as
// unhandled errors while tests still report as passing, so pin them up front.
const BROWSER_OPTIMIZE_DEPS = ["react", "react-dom", "react-dom/client", "react/jsx-runtime", "react/jsx-dev-runtime"];

// `storybook/test` is imported by story files rather than by the test runner, so
// Vite only discovers it once a story with a play function is loaded — mid-run,
// which triggers exactly the re-optimize-and-reload described above. Every story
// file that interacts with its component needs this pinned.
const STORYBOOK_OPTIMIZE_DEPS = [...BROWSER_OPTIMIZE_DEPS, "storybook/test"];

// The visual project composes the same story files, so it inherits the same
// lazy-discovery problem and then some: the component tree drags in Floating UI,
// the icon set and the class utilities, and none of them are reachable from the
// test file itself. Both reloads seen while recording baselines came from this
// list being short. Naming every dependency the run actually resolves is the
// only version of this that stays fixed as more components get baselines.
const VISUAL_OPTIMIZE_DEPS = [
  ...STORYBOOK_OPTIMIZE_DEPS,
  "@floating-ui/react",
  "@storybook/react",
  "@testing-library/react",
  "@testing-library/user-event",
  "class-variance-authority",
  "clsx",
  "lucide-react",
  "tailwind-merge",
];

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  // Components import each other by package name, which the `exports` map now
  // resolves to compiled `dist/`. Point those back at the working tree so a
  // stale build cannot masquerade as a passing test run.
  resolve: { alias: sourceAliases() },
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
          // *.visual.test.tsx and *.ssr.test.tsx also end in .test.tsx — they
          // belong to the browser-mode "visual" project and the Node-env "ssr"
          // project respectively, not here.
          exclude: [...configDefaults.exclude, "src/date-time/**", "src/**/*.visual.test.tsx", "src/**/*.ssr.test.tsx"],
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
      // Server rendering — Node env with no DOM at all, so `document` is genuinely
      // absent rather than emulated. This is the only project that renders the
      // library the way a Next.js App Router server request does; see
      // src/testing/stories.ssr.test.tsx.
      {
        extends: true,
        test: {
          name: "ssr",
          include: ["src/**/*.ssr.test.tsx"],
          environment: "node",
          isolate: false,
        },
      },
      // Visual regression — real Chromium, screenshots diffed against committed
      // baselines. Stories are the fixtures (see *.visual.test.tsx).
      {
        extends: true,
        plugins: [tailwindcss()],
        optimizeDeps: { include: VISUAL_OPTIMIZE_DEPS },
        test: {
          name: "visual",
          include: ["src/**/*.visual.test.tsx"],
          setupFiles: ["./vitest.setup.visual.ts"],
          // Same reason the storybook project below serialises, reached the same
          // way: at six files this ran parallel without complaint, and at
          // thirty-four it started timing out — Card, Field and Button each
          // failed a different run, always on "did not succeed in time", never
          // on a pixel. Screenshots contend for one browser, so the cost of
          // parallelism here is a suite that fails at random.
          fileParallelism: false,
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
        optimizeDeps: { include: STORYBOOK_OPTIMIZE_DEPS },
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
      // The same stories again in the dark theme. Identical to the project above
      // apart from the setup file, which flips the theme global — see
      // .storybook/vitest.setup.dark.ts for why this is a second project rather
      // than a decorator or a handful of dark-mode stories.
      {
        extends: true,
        plugins: [storybookTest({ configDir: path.join(dirname, ".storybook") })],
        optimizeDeps: { include: STORYBOOK_OPTIMIZE_DEPS },
        test: {
          name: "storybook-dark",
          fileParallelism: false,
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
          setupFiles: [".storybook/vitest.setup.dark.ts"],
        },
      },
    ],
  },
});
