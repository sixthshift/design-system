import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll } from "vitest";

// The real theme surface — screenshots are only meaningful if the tokens, base
// styles and fonts that ship to consumers are the ones on screen.
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "./dist/theme.generated.css";
import "./src/styles/base.css";

beforeAll(async () => {
  // Web fonts load asynchronously; screenshotting before they settle produces
  // baselines that differ run to run.
  await document.fonts.ready;
});

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute("data-theme");
});
