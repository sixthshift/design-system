import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./TagInput.stories";

const { Default, WithTags } = composeStories(stories);

describe("TagInput", () => {
  test.for(THEMES)("default - %s", async (theme) => {
    await expectScreenshot(<Default />, "default", theme);
  });

  test.for(THEMES)("with tags - %s", async (theme) => {
    await expectScreenshot(<WithTags />, "with-tags", theme);
  });
});
