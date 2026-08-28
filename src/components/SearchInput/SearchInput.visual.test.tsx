import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./SearchInput.stories";

const { WithValue, Compact, Disabled } = composeStories(stories);

describe("SearchInput", () => {
  test.for(THEMES)("with value - %s", async (theme) => {
    await expectScreenshot(<WithValue />, "with-value", theme);
  });

  test.for(THEMES)("compact - %s", async (theme) => {
    await expectScreenshot(<Compact />, "compact", theme);
  });

  test.for(THEMES)("disabled - %s", async (theme) => {
    await expectScreenshot(<Disabled />, "disabled", theme);
  });
});
