import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./Markdown.stories";

const { FormattingReference, Lists, Code } = composeStories(stories);

describe("Markdown", () => {
  test.for(THEMES)("formatting reference - %s", async (theme) => {
    await expectScreenshot(<FormattingReference />, "formatting-reference", theme);
  });

  test.for(THEMES)("lists - %s", async (theme) => {
    await expectScreenshot(<Lists />, "lists", theme);
  });

  test.for(THEMES)("code - %s", async (theme) => {
    await expectScreenshot(<Code />, "code", theme);
  });
});
