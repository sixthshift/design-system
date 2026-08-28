import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./Switch.stories";

const { AllStates, SettingsExample, Pending } = composeStories(stories);

describe("Switch", () => {
  test.for(THEMES)("all states - %s", async (theme) => {
    await expectScreenshot(<AllStates />, "all-states", theme);
  });

  test.for(THEMES)("settings example - %s", async (theme) => {
    await expectScreenshot(<SettingsExample />, "settings-example", theme);
  });

  test.for(THEMES)("pending - %s", async (theme) => {
    await expectScreenshot(<Pending />, "pending", theme);
  });
});
