import { describe, test } from "vitest";
import { composeStories, expectViewportScreenshot, openByHover, THEMES } from "../../testing/visual";
import * as stories from "./HoverCard.stories";

const { Default } = composeStories(stories);

describe("HoverCard", () => {
  // Waits on text, not a role: HoverCard.Content is a plain div.
  test.for(THEMES)("default - %s", async (theme) => {
    await expectViewportScreenshot(<Default />, "default", theme, openByHover("@jane-doe", { text: "Software Engineer" }));
  });
});
