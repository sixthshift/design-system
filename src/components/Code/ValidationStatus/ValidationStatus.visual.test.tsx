import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../../testing/visual";
import * as stories from "./ValidationStatus.stories";

const { MixedSeverities, ManyErrors, NoErrors } = composeStories(stories);

describe("ValidationStatus", () => {
  test.for(THEMES)("mixed severities - %s", async (theme) => {
    await expectScreenshot(<MixedSeverities />, "mixed-severities", theme);
  });

  test.for(THEMES)("many errors - %s", async (theme) => {
    await expectScreenshot(<ManyErrors />, "many-errors", theme);
  });

  test.for(THEMES)("no errors - %s", async (theme) => {
    await expectScreenshot(<NoErrors />, "no-errors", theme);
  });
});
