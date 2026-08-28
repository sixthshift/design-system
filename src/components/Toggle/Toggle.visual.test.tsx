import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./Toggle.stories";

const { Intents, OutlineIntents, GhostIntents, Sizes } = composeStories(stories);

describe("Toggle", () => {
  test.for(THEMES)("intents - %s", async (theme) => {
    await expectScreenshot(<Intents />, "intents", theme);
  });

  test.for(THEMES)("outline intents - %s", async (theme) => {
    await expectScreenshot(<OutlineIntents />, "outline-intents", theme);
  });

  test.for(THEMES)("ghost intents - %s", async (theme) => {
    await expectScreenshot(<GhostIntents />, "ghost-intents", theme);
  });

  test.for(THEMES)("sizes - %s", async (theme) => {
    await expectScreenshot(<Sizes />, "sizes", theme);
  });
});
