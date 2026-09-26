import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./NumberStepper.stories";

const { AllSizes, AllStates, InFormField } = composeStories(stories);

describe("NumberStepper", () => {
  test.for(THEMES)("all sizes - %s", async (theme) => {
    await expectScreenshot(<AllSizes />, "all-sizes", theme);
  });

  test.for(THEMES)("all states - %s", async (theme) => {
    await expectScreenshot(<AllStates />, "all-states", theme);
  });

  test.for(THEMES)("in form field - %s", async (theme) => {
    await expectScreenshot(<InFormField />, "in-form-field", theme);
  });
});
