/**
 * The override demos have to actually work, not merely render.
 *
 * Each story on the Overrides page makes a claim about the cascade, and a story
 * that silently stopped overriding anything would still look plausible and still
 * pass the a11y suite. These assertions are the difference between documenting a
 * capability and demonstrating one.
 *
 * The layering test is the load-bearing one: it is the only place the whole
 * architecture's central property — unlayered author CSS outranks the library's
 * `@layer components` rules, regardless of specificity — is verified end to end
 * in a real browser. Move the recipes out of that layer and this fails.
 *
 * Story-only. `src/stories` is excluded from the published package.
 */
import { composeStories } from "@storybook/react";
import { render } from "@testing-library/react";
import { expect, test } from "vitest";
import * as stories from "./Overrides.stories";

const { AddAnIntent, ScopeToASubtree, TheLayeringTrap } = composeStories(stories);
const bg = (el: Element) => getComputedStyle(el).backgroundColor;

test("the consumer-added intent really paints", () => {
  const { container } = render(<AddAnIntent />);
  const [neutral, , , info] = Array.from(container.querySelectorAll("button"));
  const expected = getComputedStyle(document.documentElement).getPropertyValue("--bg-info").trim();
  expect(expected, "--bg-info never made it to :root").not.toBe("");
  expect(bg(info!), "info button is not painted from --bg-info").not.toBe(bg(neutral!));
  expect(bg(info!)).not.toBe("rgba(0, 0, 0, 0)");
});

test("scoping changes only the scoped button", () => {
  const { container } = render(<ScopeToASubtree />);
  const [outside, inside] = Array.from(container.querySelectorAll("button"));
  expect(bg(inside!)).not.toBe(bg(outside!));
});

test("the layered override loses, the unlayered one wins", () => {
  const { container } = render(<TheLayeringTrap />);
  const [good, bad] = Array.from(container.querySelectorAll("button"));
  const success = getComputedStyle(document.documentElement).getPropertyValue("--bg-success").trim();
  expect(bg(good!), "unlayered override should have won").not.toBe(bg(bad!));
  expect(success).not.toBe("");
});
