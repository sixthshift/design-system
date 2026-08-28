import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./TagChip.stories";

const { Sizes, Namespaced, List } = composeStories(stories);

describe("TagChip", () => {
  test.for(THEMES)("sizes - %s", async (theme) => {
    await expectScreenshot(<Sizes />, "sizes", theme);
  });

  test.for(THEMES)("namespaced - %s", async (theme) => {
    await expectScreenshot(<Namespaced />, "namespaced", theme);
  });

  test.for(THEMES)("list - %s", async (theme) => {
    await expectScreenshot(<List />, "list", theme);
  });
});
