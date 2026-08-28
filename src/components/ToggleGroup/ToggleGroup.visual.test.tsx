import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./ToggleGroup.stories";

const { Variants, Sizes, Intents } = composeStories(stories);

describe("ToggleGroup", () => {
  test.for(THEMES)("variants - %s", async (theme) => {
    await expectScreenshot(<Variants />, "variants", theme);
  });

  test.for(THEMES)("sizes - %s", async (theme) => {
    await expectScreenshot(<Sizes />, "sizes", theme);
  });

  test.for(THEMES)("intents - %s", async (theme) => {
    await expectScreenshot(<Intents />, "intents", theme);
  });
});
