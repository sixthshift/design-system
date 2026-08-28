import { describe, test } from "vitest";
import { composeStories, expectScreenshot, expectViewportScreenshot, openByClick, THEMES } from "../../testing/visual";
import * as stories from "./Toast.stories";

const { Default, Intents, WithAction } = composeStories(stories);

describe("Toast", () => {
  // Portalled and bottom-anchored, so only a viewport shot shows where it lands.
  test.for(THEMES)("default - %s", async (theme) => {
    await expectViewportScreenshot(<Default />, "default", theme, openByClick("Show Toast", { role: "status" }));
  });

  test.for(THEMES)("with action - %s", async (theme) => {
    await expectViewportScreenshot(<WithAction />, "with-action", theme, openByClick("Show Toast", { role: "status" }));
  });

  // Intents is the one story that renders `standalone={false}`, so it is inline
  // and frames like any other component.
  test.for(THEMES)("intents - %s", async (theme) => {
    await expectScreenshot(<Intents />, "intents", theme);
  });
});
