import { composeStories } from "@storybook/react";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { expect } from "vitest";
import { page } from "vitest/browser";

export type Theme = "light" | "dark";

export const THEMES: readonly Theme[] = ["light", "dark"] as const;

/**
 * Mounts `ui` on the real theme surface and diffs it against the committed
 * baseline for the current browser/platform/arch.
 *
 * The subject is wrapped in padding and a token background because stories
 * lean on Storybook's `layout: "centered"` for breathing room — without it,
 * content butts against the viewport edge and clips.
 */
export async function expectScreenshot(ui: ReactElement, name: string, theme: Theme = "light"): Promise<void> {
  document.documentElement.setAttribute("data-theme", theme);

  const { container } = render(
    <div
      style={{
        display: "inline-block",
        padding: "1.5rem",
        background: "var(--bg-normal)",
      }}
    >
      {ui}
    </div>
  );

  // Shoot the padded wrapper, not the full-width container the test renderer
  // appends to <body> — keeps baselines tight and free of irrelevant pixels.
  const subject = container.firstElementChild;
  if (!subject) throw new Error("expectScreenshot: nothing rendered");

  await expect.element(page.elementLocator(subject)).toMatchScreenshot(`${name}-${theme}`);
}

/**
 * Re-export so visual tests have one import for the story-composition half of
 * the pattern: stories are the fixtures, this file is the camera.
 */
export { composeStories };
