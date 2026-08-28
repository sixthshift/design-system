import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./Message.stories";

const { IntentVariants, SizeVariants, CompoundComponents } = composeStories(stories);

describe("Message", () => {
  test.for(THEMES)("intent variants - %s", async (theme) => {
    await expectScreenshot(<IntentVariants />, "intent-variants", theme);
  });

  test.for(THEMES)("size variants - %s", async (theme) => {
    await expectScreenshot(<SizeVariants />, "size-variants", theme);
  });

  test.for(THEMES)("compound components - %s", async (theme) => {
    await expectScreenshot(<CompoundComponents />, "compound-components", theme);
  });
});
