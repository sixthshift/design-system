import { composeStories } from "@storybook/react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
 * Shoots the whole viewport rather than a shrink-wrapped frame, for overlays.
 *
 * Modal, Sheet, Toast, Tooltip, Popover and HoverCard all render through
 * `FloatingPortal` to `document.body`, so their content is nowhere inside the
 * element `expectScreenshot` shoots — a baseline taken that way captures the
 * trigger button and nothing else, and passes forever.
 *
 * Two ways out, and this is the one chosen: give the harness a viewport-sized
 * surface and shoot that. The alternative — an inline, non-portalled
 * presentation authored per story — would produce a baseline of a rendering
 * mode the library never ships, and would drop exactly the things most likely
 * to regress: the backdrop, the centring, and the Floating UI placement.
 *
 * The surface is `position: fixed; inset: 0`, so its box *is* the 1280x720
 * viewport. Portalled content is painted over that region and lands in the
 * shot, even though it is not a descendant.
 *
 * `open` is where the overlay gets opened — every overlay story starts closed,
 * so without it the shot is of a button. It receives the rendered subject, and
 * should not return until the overlay is on screen and settled; motion is
 * already frozen (see the `reducedMotion` note in vitest.config.ts), so
 * awaiting the element's appearance is enough.
 */
export async function expectViewportScreenshot(
  ui: ReactElement,
  name: string,
  theme: Theme = "light",
  open?: (subject: HTMLElement) => Promise<void>
): Promise<void> {
  document.documentElement.setAttribute("data-theme", theme);

  const { container } = render(
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        // Same inset as the framed shot, for the same reason: without it a
        // trigger sits flush against y=0 and its underline or focus ring is
        // clipped by the viewport edge.
        padding: "1.5rem",
        background: "var(--bg-normal)",
      }}
    >
      {ui}
    </div>
  );

  const subject = container.firstElementChild;
  if (!subject) throw new Error("expectViewportScreenshot: nothing rendered");

  if (open) await open(subject as HTMLElement);

  // After the overlay mounts, not before: a portalled surface can pull in a
  // weight the trigger never used.
  await document.fonts.ready;

  await expect.element(page.elementLocator(subject)).toMatchScreenshot(`${name}-${theme}`);
}

/**
 * The two ways an overlay in this library gets opened, as `open` callbacks for
 * `expectViewportScreenshot`.
 *
 * Both wait on the *portalled* result through `screen` rather than the subject,
 * which is the whole point: the thing that has to appear is not a descendant of
 * what was rendered. Both are deliberately thin — anything more elaborate than
 * "press this, wait for that" belongs in the test that needs it.
 */
/**
 * What to wait for. A role where the overlay has one; text where it does not —
 * HoverCard's content is a plain div, so there is no role to query.
 */
export type Appears = { role: string; name?: string | RegExp } | { text: string | RegExp };

// 2s, not the 1s default: HoverCard's `delayShow` alone is 500ms.
const APPEAR_TIMEOUT = { timeout: 2000 };

function waitForOverlay(appears: Appears): Promise<HTMLElement> {
  if ("text" in appears) return screen.findByText(appears.text, {}, APPEAR_TIMEOUT);
  return screen.findByRole(appears.role, appears.name === undefined ? {} : { name: appears.name }, APPEAR_TIMEOUT);
}

export function openByClick(trigger: string | RegExp, appears: Appears) {
  return async (subject: HTMLElement) => {
    await userEvent.click(within(subject).getByRole("button", { name: trigger }));
    await waitForOverlay(appears);
  };
}

export function openByHover(trigger: string | RegExp, appears: Appears) {
  return async (subject: HTMLElement) => {
    await userEvent.hover(within(subject).getByText(trigger));
    await waitForOverlay(appears);
  };
}

/**
 * Re-export so visual tests have one import for the story-composition half of
 * the pattern: stories are the fixtures, this file is the camera.
 */
export { composeStories };
