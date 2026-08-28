import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./RadioButton.stories";

const { AllStates, RadioButtonGroup } = composeStories(stories);

describe("RadioButton", () => {
  test.for(THEMES)("all states - %s", async (theme) => {
    await expectScreenshot(<AllStates />, "all-states", theme);
  });

  test.for(THEMES)("radio button group - %s", async (theme) => {
    await expectScreenshot(<RadioButtonGroup />, "radio-button-group", theme);
  });
});
