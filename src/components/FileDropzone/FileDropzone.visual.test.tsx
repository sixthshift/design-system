import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./FileDropzone.stories";

const { AllStates, Active } = composeStories(stories);

describe("FileDropzone", () => {
  test.for(THEMES)("all states - %s", async (theme) => {
    await expectScreenshot(<AllStates />, "all-states", theme);
  });

  test.for(THEMES)("active - %s", async (theme) => {
    await expectScreenshot(<Active />, "active", theme);
  });
});
