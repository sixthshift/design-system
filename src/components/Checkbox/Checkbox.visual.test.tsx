import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./Checkbox.stories";

const { AllStates, CheckboxGroup, Indeterminate } = composeStories(stories);

describe("Checkbox", () => {
  test.for(THEMES)("all states - %s", async (theme) => {
    await expectScreenshot(<AllStates />, "all-states", theme);
  });

  test.for(THEMES)("checkbox group - %s", async (theme) => {
    await expectScreenshot(<CheckboxGroup />, "checkbox-group", theme);
  });

  test.for(THEMES)("indeterminate - %s", async (theme) => {
    await expectScreenshot(<Indeterminate />, "indeterminate", theme);
  });
});
