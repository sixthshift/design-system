import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./DataTable.stories";

const { AllSizes, Empty, WithRowActions } = composeStories(stories);

describe("DataTable", () => {
  test.for(THEMES)("all sizes - %s", async (theme) => {
    await expectScreenshot(<AllSizes />, "all-sizes", theme);
  });

  test.for(THEMES)("empty - %s", async (theme) => {
    await expectScreenshot(<Empty />, "empty", theme);
  });

  test.for(THEMES)("with row actions - %s", async (theme) => {
    await expectScreenshot(<WithRowActions />, "with-row-actions", theme);
  });
});
