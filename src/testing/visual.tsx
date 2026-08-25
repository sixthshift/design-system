import { composeStories } from "@storybook/react";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { expect } from "vitest";
import { page } from "vitest/browser";

export type Theme = "light" | "dark";

export const THEMES: readonly Theme[] = ["light", "dark"] as const;

/**
 * Fixed frame width for every baseline.
 *
 * The frame is deliberately NOT shrink-to-fit. A shrink-wrapped box takes its
 * width from measured text, so any difference in font metrics changes the image
 * *dimensions* — and a dimension mismatch fails outright, before the pixel
 * tolerance is ever consulted. A fixed frame turns that same difference into a
 * pixel diff the comparator can actually judge.
 */
const DEFAULT_FRAME_WIDTH = 720;

export type ScreenshotOptions = {
  /** Override the frame width for content wider than the default. */
  width?: number;
};

/**
 * Mounts `ui` on the real theme surface and diffs it against the committed
 * baseline for the current browser/platform/arch.
 *
 * The subject is wrapped in padding and a token background because stories lean
 * on Storybook's `layout: "centered"` for breathing room — without it, content
 * butts against the viewport edge and clips.
 */
export async function expectScreenshot(
  ui: ReactElement,
  name: string,
  theme: Theme = "light",
  { width = DEFAULT_FRAME_WIDTH }: ScreenshotOptions = {}
): Promise<void> {
  document.documentElement.setAttribute("data-theme", theme);

  const { container } = render(
    <div
      style={{
        width: `${width}px`,
        padding: "1.5rem",
        background: "var(--bg-normal)",
      }}
    >
      {ui}
    </div>
  );

  // Fonts are requested lazily as text is laid out, so the wait has to happen
  // after the subject renders, not once in setup.
  await document.fonts.ready;

  // Shoot the fixed-width frame, not the full-height container the test renderer
  // appends to <body>.
  const subject = container.firstElementChild;
  if (!subject) throw new Error("expectScreenshot: nothing rendered");

  await expect.element(page.elementLocator(subject)).toMatchScreenshot(`${name}-${theme}`);
}

/**
 * Re-export so visual tests have one import for the story-composition half of
 * the pattern: stories are the fixtures, this file is the camera.
 */
export { composeStories };
