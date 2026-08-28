import { describe, test } from "vitest";
import { composeStories, expectViewportScreenshot, openByClick, THEMES } from "../../testing/visual";
import * as stories from "./Popover.stories";

const { Default, WithForm } = composeStories(stories);

describe("Popover", () => {
  test.for(THEMES)("default - %s", async (theme) => {
    await expectViewportScreenshot(<Default />, "default", theme, openByClick("Open Popover", { role: "dialog", name: "Open Popover" }));
  });

  test.for(THEMES)("with form - %s", async (theme) => {
    await expectViewportScreenshot(<WithForm />, "with-form", theme, openByClick(/dimensions/i, { role: "dialog" }));
  });
});
