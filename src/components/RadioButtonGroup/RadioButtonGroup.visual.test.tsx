import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./RadioButtonGroup.stories";

const { ButtonSegmented, ButtonSeparate, WithDisabledOption } = composeStories(stories);

describe("RadioButtonGroup", () => {
  test.for(THEMES)("button segmented - %s", async (theme) => {
    await expectScreenshot(<ButtonSegmented />, "button-segmented", theme);
  });

  test.for(THEMES)("button separate - %s", async (theme) => {
    await expectScreenshot(<ButtonSeparate />, "button-separate", theme);
  });

  test.for(THEMES)("with disabled option - %s", async (theme) => {
    await expectScreenshot(<WithDisabledOption />, "with-disabled-option", theme);
  });
});
