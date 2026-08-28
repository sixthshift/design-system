import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./TextInline.stories";

const { GapSizes, AlignmentOptions, WithBadge } = composeStories(stories);

describe("TextInline", () => {
  test.for(THEMES)("gap sizes - %s", async (theme) => {
    await expectScreenshot(<GapSizes />, "gap-sizes", theme);
  });

  test.for(THEMES)("alignment options - %s", async (theme) => {
    await expectScreenshot(<AlignmentOptions />, "alignment-options", theme);
  });

  test.for(THEMES)("with badge - %s", async (theme) => {
    await expectScreenshot(<WithBadge />, "with-badge", theme);
  });
});
