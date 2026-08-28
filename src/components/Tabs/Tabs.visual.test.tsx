import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./Tabs.stories";

const { WithBadges, Vertical, WithDisabledTab } = composeStories(stories);

describe("Tabs", () => {
  test.for(THEMES)("with badges - %s", async (theme) => {
    await expectScreenshot(<WithBadges />, "with-badges", theme);
  });

  test.for(THEMES)("vertical - %s", async (theme) => {
    await expectScreenshot(<Vertical />, "vertical", theme);
  });

  test.for(THEMES)("with disabled tab - %s", async (theme) => {
    await expectScreenshot(<WithDisabledTab />, "with-disabled-tab", theme);
  });
});
