import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./Input.stories";

const { AllTypes, IconExamples, PasswordWithToggle } = composeStories(stories);

describe("Input", () => {
  test.for(THEMES)("all types - %s", async (theme) => {
    await expectScreenshot(<AllTypes />, "all-types", theme);
  });

  test.for(THEMES)("icon examples - %s", async (theme) => {
    await expectScreenshot(<IconExamples />, "icon-examples", theme);
  });

  test.for(THEMES)("password with toggle - %s", async (theme) => {
    await expectScreenshot(<PasswordWithToggle />, "password-with-toggle", theme);
  });
});
