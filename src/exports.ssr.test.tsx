/**
 * Server rendering, for the whole library at once.
 *
 * Runs in the "ssr" project: Node, no DOM, no setup file. `document` and
 * `window` genuinely do not exist here, which is the point — the "unit"
 * project's happy-dom supplies both, so a component reading `document.body`
 * during render passes there and fails only in a consumer's build. That is
 * exactly how `OverlayProvider` shipped broken.
 *
 * Two layers:
 *
 *   1. A sweep over every subpath in the `exports` map. Broad but shallow:
 *      most components need props, and a component that throws on a missing
 *      prop never reaches whatever DOM access it might have made. So the
 *      sweep asserts only that nothing fails *because of* a browser global —
 *      it proves the absence of one class of bug, not that rendering works.
 *   2. Named cases with real props, below, which is where the actual
 *      assertions live. Anything portal- or overlay-based belongs there.
 */
import { readFileSync } from "node:fs";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@sixthshift/design-system/hover-card";
import { Modal, ModalBody, ModalHeader } from "@sixthshift/design-system/modal";
import { OverlayProvider } from "@sixthshift/design-system/overlay";
import { Popover, PopoverBody, PopoverTrigger } from "@sixthshift/design-system/popover";
import { Select } from "@sixthshift/design-system/select";
import { Sheet } from "@sixthshift/design-system/sheet";
import { Tabs } from "@sixthshift/design-system/tabs";
import { Toast } from "@sixthshift/design-system/toast";
import { Tooltip, TooltipBody, TooltipTrigger } from "@sixthshift/design-system/tooltip";
import { createElement, type ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

/** A failure caused by reaching for something only a browser has. */
const BROWSER_GLOBAL =
  /\b(document|window|navigator|localStorage|sessionStorage|matchMedia|HTMLElement|Element)\b.*\b(is not defined|undefined)\b|\bcannot read propert\w+ of undefined \(reading '(body|documentElement)'\)/i;

it("has no DOM in this environment, or the sweep below proves nothing", () => {
  expect(typeof document).toBe("undefined");
  expect(typeof window).toBe("undefined");
});

describe("every export survives a server render", () => {
  // Not components: CSS, hooks, pure helpers, the token vocabulary.
  const notComponents = new Set(["./theme.css", "./theme", "./utils", "./format", "./hooks", "./date-time", "./components"]);
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as { exports: Record<string, unknown> };
  const subpaths = Object.keys(pkg.exports).filter((key) => !notComponents.has(key));

  it("covers the whole exports map", () => {
    // A guard on the sweep itself: if the filter or the map changes shape and
    // this collapses to a handful of subpaths, the sweep silently stops testing.
    expect(subpaths.length).toBeGreaterThan(50);
  });

  it.for(subpaths)("%s", async (subpath) => {
    const mod = (await import(`@sixthshift/design-system${subpath.slice(1)}`)) as Record<string, unknown>;

    for (const [name, value] of Object.entries(mod)) {
      // Components only: skip hooks, `cva` variant functions and helpers
      // (lowercase by convention), contexts and plain values.
      if (/^[a-z]/.test(name)) continue;
      const renderable = typeof value === "function" || (typeof value === "object" && value !== null && "render" in value);
      if (!renderable) continue;

      try {
        renderToString(createElement(value as never));
      } catch (error) {
        // A missing required prop or a compound used outside its parent is not
        // what this test is about; reaching for a browser global is.
        const message = String((error as Error)?.message ?? error);
        expect(message, `${subpath} → ${name} touched a browser global during render`).not.toMatch(BROWSER_GLOBAL);
      }
    }
  });
});

describe("overlays and portals", () => {
  const options = [
    { value: "a", label: "A" },
    { value: "b", label: "B" },
  ];
  const noop = () => {};

  /** Server-render and hand back the markup. Throwing is the failure. */
  const ssr = (element: ReactElement) => renderToString(element);

  it("OverlayProvider renders its children", () => {
    // The regression: it defaulted its portal roots to `document.body` during
    // render, so an SSR app could not mount the provider at all — and with it
    // unmountable, the modal and toast stacks were unreachable on the server.
    expect(ssr(<OverlayProvider>content</OverlayProvider>)).toContain("content");
  });

  it("OverlayProvider portals nothing, both stacks starting empty", () => {
    const html = ssr(<OverlayProvider>content</OverlayProvider>);
    expect(html).not.toContain("z-toast");
  });

  it("Popover renders its trigger, open or closed", () => {
    const closed = ssr(
      <Popover>
        <PopoverTrigger>open me</PopoverTrigger>
        <PopoverBody>body</PopoverBody>
      </Popover>
    );
    expect(closed).toContain("open me");
    expect(
      ssr(
        <Popover open>
          <PopoverTrigger>open me</PopoverTrigger>
          <PopoverBody>body</PopoverBody>
        </Popover>
      )
    ).toContain("open me");
  });

  it("Tooltip and HoverCard render their triggers", () => {
    expect(
      ssr(
        <Tooltip open>
          <TooltipTrigger>hover me</TooltipTrigger>
          <TooltipBody>tip</TooltipBody>
        </Tooltip>
      )
    ).toContain("hover me");
    // HoverCardTrigger is `asChild` by default, so it needs an element child.
    expect(
      ssr(
        <HoverCard open>
          <HoverCardTrigger>
            <span>hover me</span>
          </HoverCardTrigger>
          <HoverCardContent>card</HoverCardContent>
        </HoverCard>
      )
    ).toContain("hover me");
  });

  it("Select renders its current value", () => {
    expect(ssr(<Select options={options} value="a" onValueChange={noop} />)).toContain("A");
  });

  it("Tabs renders its list and panels", () => {
    const html = ssr(
      <Tabs items={[{ value: "a", label: "Alpha", content: "one" }]} value="a">
        <Tabs.List />
        <Tabs.Panels />
      </Tabs>
    );
    expect(html).toContain("Alpha");
    expect(html).toContain("one");
  });

  it("Modal, Sheet and Toast render nothing until the client mounts them", () => {
    // Characterising current behaviour, not endorsing it: all three gate on
    // `usePresence`, which starts hidden and is only shown from an effect, so
    // the server emits nothing and the content appears after hydration. That
    // is right for something opened by interaction, and wrong if a modal ever
    // needs to be open on first paint. Change the behaviour and change this.
    expect(ssr(<Modal aria-label="m">body</Modal>)).toBe("");
    // Sheet takes `open`, so it is asked to be open here — it still emits
    // nothing, which is the behaviour being characterised, not a closed sheet.
    expect(
      ssr(
        <Sheet aria-label="s" open onOpenChange={noop}>
          body
        </Sheet>
      )
    ).toBe("");
    expect(ssr(<Toast>note</Toast>)).toBe("");
    expect(
      ssr(
        <Modal aria-label="m">
          <ModalHeader>head</ModalHeader>
          <ModalBody>body</ModalBody>
        </Modal>
      )
    ).toBe("");
  });
});
