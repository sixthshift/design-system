import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./Card.stories";

const { Default, WithHeaderAction, BillCard } = composeStories(stories);

describe("Card", () => {
  test.for(THEMES)("default - %s", async (theme) => {
    await expectScreenshot(<Default />, "default", theme);
  });

  test.for(THEMES)("with header action - %s", async (theme) => {
    await expectScreenshot(<WithHeaderAction />, "with-header-action", theme);
  });

  test.for(THEMES)("bill card - %s", async (theme) => {
    await expectScreenshot(<BillCard />, "bill-card", theme);
  });
});
