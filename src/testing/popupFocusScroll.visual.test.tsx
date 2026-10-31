import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { DatePicker } from "../components/DatePicker";
import { DateTimePicker } from "../components/DateTimePicker";
import { DateTimeRangePicker } from "../components/DateTimeRangePicker";
import { Select } from "../components/Select";
import { TimePicker } from "../components/TimePicker";

/**
 * A popup that focuses itself as it opens must not scroll the page.
 *
 * Lives in the visual project because it needs what only a real browser has:
 * layout, a scrollable document, and `focus()` actually scrolling. happy-dom
 * has none of those, so the unit tests can only check the `preventScroll` flag
 * is passed — this checks the page stays put.
 *
 * The popups portal to `document.body` and are focused before floating-ui has
 * placed them, while they still sit at the top of the document. A plain
 * `focus()` there scrolls the page to the top.
 */

const options = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
];

/** Renders `ui` between two screens of padding and scrolls it into the middle. */
function renderLowOnLongPage(ui: ReactElement): HTMLElement {
  const { container } = render(
    <div>
      <div style={{ height: "300vh" }} />
      <div data-testid="subject">{ui}</div>
      <div style={{ height: "300vh" }} />
    </div>
  );
  const subject = within(container).getByTestId("subject");
  // Instant, not `scrollIntoView`: the Storybook stylesheet sets
  // `scroll-behavior: smooth`, and a scroll still animating would read as a
  // jump.
  window.scrollTo({ top: subject.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2, behavior: "instant" });
  return subject;
}

/** Two frames: floating-ui positions on the next one, and any scroll lands with it. */
const settle = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

const isFocused = (role: string) => () => expect(document.activeElement?.getAttribute("role")).toBe(role);
const isFocusedDay = () => expect(document.activeElement?.hasAttribute("data-date")).toBe(true);

async function expectOpeningKeepsPlace(open: () => Promise<void>, focused: () => void) {
  const before = window.scrollY;
  expect(before).toBeGreaterThan(0);

  await open();
  await waitFor(focused);
  await settle();

  expect(window.scrollY).toBe(before);
}

/** The project's desktop viewport, and a phone's. */
const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 720 },
  { name: "phone", width: 390, height: 844 },
] as const;

describe.each(VIEWPORTS)("opening a popup low on a long page keeps your place - $name", ({ width, height }) => {
  beforeAll(() => page.viewport(width, height));
  afterAll(() => page.viewport(VIEWPORTS[0].width, VIEWPORTS[0].height));

  test("Select", async () => {
    const user = userEvent.setup();
    renderLowOnLongPage(<Select value="apple" options={options} onValueChange={() => {}} />);

    await expectOpeningKeepsPlace(() => user.click(screen.getByRole("combobox")), isFocused("listbox"));
  });

  // A regression guard rather than a repro: the click already focuses the
  // input, so the opening focus() is a no-op and the page holds either way.
  test("Select, searchable", async () => {
    const user = userEvent.setup();
    renderLowOnLongPage(<Select value="apple" options={options} onValueChange={() => {}} searchable />);

    await expectOpeningKeepsPlace(() => user.click(screen.getByRole("combobox")), isFocused("combobox"));
  });

  test("DatePicker, Alt+ArrowDown", async () => {
    const user = userEvent.setup();
    renderLowOnLongPage(<DatePicker value="2025-01-15" onChange={() => {}} />);
    await user.click(screen.getByRole("spinbutton", { name: "Month" }));

    await expectOpeningKeepsPlace(() => user.keyboard("{Alt>}{ArrowDown}{/Alt}"), isFocusedDay);
  });

  test("DateTimePicker, Alt+ArrowDown", async () => {
    const user = userEvent.setup();
    renderLowOnLongPage(<DateTimePicker value="2026-01-24T12:30:00Z" onChange={() => {}} />);
    await user.click(screen.getByRole("spinbutton", { name: "Month" }));

    await expectOpeningKeepsPlace(() => user.keyboard("{Alt>}{ArrowDown}{/Alt}"), isFocusedDay);
  });

  test("DateTimeRangePicker, Alt+ArrowDown", async () => {
    const user = userEvent.setup();
    renderLowOnLongPage(<DateTimeRangePicker />);
    await user.click(screen.getAllByRole("spinbutton", { name: "Month" })[0] as HTMLElement);

    await expectOpeningKeepsPlace(() => user.keyboard("{Alt>}{ArrowDown}{/Alt}"), isFocusedDay);
  });

  test("TimePicker, Alt+ArrowDown", async () => {
    const user = userEvent.setup();
    renderLowOnLongPage(<TimePicker defaultValue="09:30" clockFormat="24h" />);
    await user.click(screen.getByRole("spinbutton", { name: "Hour" }));

    await expectOpeningKeepsPlace(() => user.keyboard("{Alt>}{ArrowDown}{/Alt}"), isFocused("option"));
  });
});
