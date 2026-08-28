import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./FormField.stories";

const { FullExample, WithErrorFeedback, WithDescription } = composeStories(stories);

describe("FormField", () => {
  test.for(THEMES)("full example - %s", async (theme) => {
    await expectScreenshot(<FullExample />, "full-example", theme);
  });

  test.for(THEMES)("with error feedback - %s", async (theme) => {
    await expectScreenshot(<WithErrorFeedback />, "with-error-feedback", theme);
  });

  test.for(THEMES)("with description - %s", async (theme) => {
    await expectScreenshot(<WithDescription />, "with-description", theme);
  });
});
