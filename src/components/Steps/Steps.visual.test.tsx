import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./Steps.stories";

const { AllStates, Vertical, WithDescriptions } = composeStories(stories);

describe("Steps", () => {
  test.for(THEMES)("all states - %s", async (theme) => {
    await expectScreenshot(<AllStates />, "all-states", theme);
  });

  test.for(THEMES)("vertical - %s", async (theme) => {
    await expectScreenshot(<Vertical />, "vertical", theme);
  });

  test.for(THEMES)("with descriptions - %s", async (theme) => {
    await expectScreenshot(<WithDescriptions />, "with-descriptions", theme);
  });
});
