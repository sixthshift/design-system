import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./CheckboxGroup.stories";

const { ButtonSegmented, ButtonSeparate, WithDisabledOption } = composeStories(stories);

describe("CheckboxGroup", () => {
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
