import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./Select.stories";

const { Default, Disabled, MultipleClearable } = composeStories(stories);

describe("Select", () => {
  test.for(THEMES)("default - %s", async (theme) => {
    await expectScreenshot(<Default />, "default", theme);
  });

  test.for(THEMES)("disabled - %s", async (theme) => {
    await expectScreenshot(<Disabled />, "disabled", theme);
  });

  test.for(THEMES)("multiple clearable - %s", async (theme) => {
    await expectScreenshot(<MultipleClearable />, "multiple-clearable", theme);
  });
});
