import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll } from "vitest";

// The real theme surface — screenshots are only meaningful if the tokens, base
// styles and fonts are the ones on screen. .storybook/styles.css is the same
// stylesheet Storybook renders with: a consumer-shaped entry point, widened to
// the story-only utilities the baselines are screenshots of.
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "./.storybook/styles.css";

// Belt-and-braces with the browser context's reducedMotion (see vitest.config.ts).
// A screenshot taken mid-transition is not reproducible, and `animate-spin` on a
// loading Button never finishes at all, so freeze everything outright.
const FREEZE_MOTION = `
  *, *::before, *::after {
    animation-delay: -1ms !important;
    animation-duration: 0ms !important;
    animation-iteration-count: 1 !important;
    transition-delay: 0ms !important;
    transition-duration: 0ms !important;
  }
`;

beforeAll(async () => {
  const style = document.createElement("style");
  style.setAttribute("data-visual-test", "freeze-motion");
  style.textContent = FREEZE_MOTION;
  document.head.appendChild(style);

  // `document.fonts.ready` only settles work already in flight. At this point
  // nothing has rendered, so no font file has been requested and it would
  // resolve immediately — leaving the first screenshot free to paint in a
  // fallback face. Request the faces explicitly, then wait.
  await Promise.all([
    document.fonts.load('400 1rem "Inter Variable"'),
    document.fonts.load('500 1rem "Inter Variable"'),
    document.fonts.load('600 1rem "Inter Variable"'),
    document.fonts.load('700 1rem "Inter Variable"'),
    document.fonts.load('400 1rem "JetBrains Mono Variable"'),
  ]);
  await document.fonts.ready;
});

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute("data-theme");
});
