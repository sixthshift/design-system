import { describe, test } from "vitest";
import { composeStories, expectScreenshot, THEMES } from "../../testing/visual";
import * as stories from "./Badge.stories";

const { VariantIntentMatrix, StatusExamples, WithCount } = composeStories(stories);

describe("Badge", () => {
  test.for(THEMES)("variant intent matrix - %s", async (theme) => {
    await expectScreenshot(<VariantIntentMatrix />, "variant-intent-matrix", theme);
  });

  test.for(THEMES)("status examples - %s", async (theme) => {
    await expectScreenshot(<StatusExamples />, "status-examples", theme);
  });

  test.for(THEMES)("with count - %s", async (theme) => {
    await expectScreenshot(<WithCount />, "with-count", theme);
  });
});
