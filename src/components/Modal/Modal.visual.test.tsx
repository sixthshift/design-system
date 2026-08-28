import { describe, test } from "vitest";
import { composeStories, expectViewportScreenshot, openByClick, THEMES } from "../../testing/visual";
import * as stories from "./Modal.stories";

const { Default, FormModal } = composeStories(stories);

// Viewport shots: the dialog and its backdrop are portalled to document.body,
// so a framed shot would capture the trigger button and nothing else.
describe("Modal", () => {
  test.for(THEMES)("default - %s", async (theme) => {
    await expectViewportScreenshot(<Default />, "default", theme, openByClick("Open Modal", { role: "dialog", name: "Confirm Action" }));
  });

  test.for(THEMES)("form modal - %s", async (theme) => {
    await expectViewportScreenshot(<FormModal />, "form-modal", theme, openByClick("Add New Task", { role: "dialog", name: "Create Task" }));
  });
});
