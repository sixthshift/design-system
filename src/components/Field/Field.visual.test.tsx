import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./Field.stories";

const { RowLayout, IdentifiersCard, LongIdentifierWraps } = composeStories(stories);

describe("Field", () => {
  test.for(THEMES)("row layout - %s", async (theme) => {
    await expectScreenshot(<RowLayout />, "row-layout", theme);
  });

  test.for(THEMES)("identifiers card - %s", async (theme) => {
    await expectScreenshot(<IdentifiersCard />, "identifiers-card", theme);
  });

  test.for(THEMES)("long identifier wraps - %s", async (theme) => {
    await expectScreenshot(<LongIdentifierWraps />, "long-identifier-wraps", theme);
  });
});
