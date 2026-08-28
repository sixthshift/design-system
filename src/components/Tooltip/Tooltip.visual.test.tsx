import { describe, test } from "vitest";
import { composeStories, expectViewportScreenshot, openByHover, THEMES } from "../../testing/visual";
import * as stories from "./Tooltip.stories";

const { Default } = composeStories(stories);

describe("Tooltip", () => {
  // Hovered, not clicked: a click also focuses the trigger, and the focus ring
  // is not part of what this story documents.
  test.for(THEMES)("default - %s", async (theme) => {
    await expectViewportScreenshot(<Default />, "default", theme, openByHover("Hover me", { role: "tooltip" }));
  });
});
