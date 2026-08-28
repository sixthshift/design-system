import { describe, test } from "vitest";
import { composeStories, expectViewportScreenshot, openByClick, THEMES } from "../../testing/visual";
import * as stories from "./Sheet.stories";

const { Default, LeftSide } = composeStories(stories);

describe("Sheet", () => {
  test.for(THEMES)("default - %s", async (theme) => {
    await expectViewportScreenshot(<Default />, "default", theme, openByClick("Open Sheet", { role: "dialog", name: /Sheet Title/ }));
  });

  test.for(THEMES)("left side - %s", async (theme) => {
    await expectViewportScreenshot(<LeftSide />, "left-side", theme, openByClick("Open Left Sheet", { role: "dialog", name: /Left Sheet/ }));
  });
});
