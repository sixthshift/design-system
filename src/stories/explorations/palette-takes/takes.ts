/**
 * The palette premises this exploration compares, generated rather than listed.
 *
 * Each take is three numbers per family — hue, peak chroma, and whether it runs
 * on the neutral spine — put through the same OKLCH construction that produced
 * the shipped palette. That is the point: a comparison between takes is only
 * fair if the construction quality is held constant, so what differs on the page
 * is the premise and nothing else. It also means a take is editable. Change a
 * hue here and the ramps, the vignettes and the plot all move together.
 *
 * See plans/10-default-palette-premise.md for the decision this feeds, and the
 * Palette page for the spine itself.
 *
 * Story-only. `src/stories` is excluded from the published package.
 */

export const STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
export type Stop = (typeof STOPS)[number];

/** The shipped spine. Neutrals run deeper below 700 — see the Palette page. */
const LIGHTNESS: Record<Stop, number> = {
  50: 0.982,
  100: 0.95,
  200: 0.898,
  300: 0.82,
  400: 0.7,
  500: 0.545,
  600: 0.47,
  700: 0.404,
  800: 0.336,
  900: 0.272,
  950: 0.205,
};
const LIGHTNESS_NEUTRAL: Record<Stop, number> = { ...LIGHTNESS, 700: 0.39, 800: 0.3, 900: 0.225, 950: 0.15 };
const CHROMA: Record<Stop, number> = { 50: 0.07, 100: 0.19, 200: 0.37, 300: 0.58, 400: 0.8, 500: 0.97, 600: 1, 700: 0.88, 800: 0.72, 900: 0.58, 950: 0.42 };

const encode = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

/** OKLCH to linear sRGB. Out-of-gamut channels come back outside 0–1. */
function linearRgb(lightness: number, chroma: number, hue: number): [number, number, number] {
  const a = chroma * Math.cos((hue * Math.PI) / 180);
  const b = chroma * Math.sin((hue * Math.PI) / 180);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const inGamut = (rgb: number[]) => rgb.every((channel) => channel >= -1e-4 && channel <= 1 + 1e-4);

/** One colour, gamut-mapped by reducing chroma until every channel is in range. */
export function oklch(lightness: number, chroma: number, hue: number): string {
  let mapped = chroma;
  if (!inGamut(linearRgb(lightness, chroma, hue))) {
    let low = 0;
    let high = chroma;
    for (let step = 0; step < 24; step++) {
      const mid = (low + high) / 2;
      if (inGamut(linearRgb(lightness, mid, hue))) low = mid;
      else high = mid;
    }
    mapped = low;
  }
  return `#${linearRgb(lightness, mapped, hue)
    .map((channel) =>
      Math.round(Math.min(1, Math.max(0, encode(channel))) * 255)
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`;
}

/** Eleven stops of one family. */
export function ramp(hue: number, peakChroma: number, neutral = false): string[] {
  const spine = neutral ? LIGHTNESS_NEUTRAL : LIGHTNESS;
  return STOPS.map((stop) => oklch(spine[stop], peakChroma * CHROMA[stop], hue));
}

export type Palette = { neutral: string[]; accent: string[]; green: string[]; amber: string[]; red: string[] };
export const FAMILIES = ["neutral", "accent", "green", "amber", "red"] as const;

/** `[hue, peakChroma]` per family. The neutral is always on the neutral spine. */
type Spec = Record<keyof Palette, [number, number]>;

const build = (spec: Spec): Palette => ({
  neutral: ramp(spec.neutral[0], spec.neutral[1], true),
  accent: ramp(...spec.accent),
  green: ramp(...spec.green),
  amber: ramp(...spec.amber),
  red: ramp(...spec.red),
});

export type Take = {
  id: string;
  number: string;
  name: string;
  thesis: string;
  shipsIn: string;
  breaksWhen: string;
  /** Position on the two axes the page argues are the ones that matter, 1–5. */
  asserts: number;
  survivesSwap: number;
  palette: Palette;
};

export const TAKES: Take[] = [
  {
    id: "ink",
    number: "01",
    name: "Ink-led",
    thesis: "The brand is not a hue. Buttons are near-black, and colour is rationed to state.",
    shipsIn: "shadcn/ui, Vercel Geist, Linear",
    breaksWhen:
      "It reads premium B2B before it reads anything else — and it collapses with any existing `strong` neutral rung, since both want the same near-black.",
    asserts: 1.2,
    survivesSwap: 3.4,
    palette: build({ neutral: [265, 0.006], accent: [250, 0.1], green: [150, 0.09], amber: [70, 0.11], red: [28, 0.135] }),
  },
  {
    id: "anchored",
    number: "02",
    name: "Hue-anchored",
    thesis: "One temperature runs through everything, the grey included. Warm here, so it reads as paper rather than as screen.",
    shipsIn: "Radix (sand, sage, olive), IBM Carbon warm grey",
    breaksWhen: "The cast is a commitment. A consumer whose brand fights the temperature has to replace the neutral too, not just the accent.",
    asserts: 2.1,
    survivesSwap: 3.1,
    palette: build({ neutral: [75, 0.009], accent: [258, 0.11], green: [148, 0.098], amber: [70, 0.118], red: [30, 0.142] }),
  },
  {
    id: "locked",
    number: "03",
    name: "Contrast-locked",
    thesis: "Steps are defined by guaranteed contrast ratios rather than by eye, so any hue dropped in is accessible by construction.",
    shipsIn: "U.S. Web Design System — a 50-grade gap guarantees 4.5:1",
    breaksWhen: "Optimising for the audit flattens the middle of every ramp. Correct, and a little joyless.",
    asserts: 1,
    survivesSwap: 4.5,
    palette: build({ neutral: [250, 0.004], accent: [240, 0.13], green: [145, 0.11], amber: [75, 0.13], red: [25, 0.16] }),
  },
  {
    id: "seeded",
    number: "04",
    name: "Seeded / generative",
    thesis: "One hex in, whole system out. Tonal palettes and role pairs derived by algorithm.",
    shipsIn: "Material 3, Ant Design",
    breaksWhen:
      "The output has a recognisably algorithmic flavour, and the role vocabulary — `primary-container`, `on-primary-container` — is a large thing to adopt wholesale.",
    asserts: 3,
    survivesSwap: 4.7,
    palette: build({ neutral: [300, 0.008], accent: [300, 0.13], green: [160, 0.11], amber: [80, 0.12], red: [20, 0.15] }),
  },
  {
    id: "workhorse",
    number: "05",
    name: "Muted workhorse",
    thesis: "Everything sits in one mid-chroma band. Nothing shouts, because the screen is already full of data.",
    shipsIn: "Atlassian, and most enterprise admin and BI tools",
    breaksWhen: "At that chroma, state has to be carried by weight and iconography too — colour alone stops being findable in a dense table.",
    asserts: 1.7,
    survivesSwap: 2.6,
    palette: build({ neutral: [230, 0.01], accent: [230, 0.08], green: [155, 0.07], amber: [72, 0.09], red: [28, 0.105] }),
  },
  {
    id: "expressive",
    number: "06",
    name: "Expressive",
    thesis: "High chroma, colour as the point rather than as the signal.",
    shipsIn: "Duolingo, Basecamp, most consumer and education products",
    breaksWhen: "It is a costume you cannot take off. Wonderful for one product, unusable as the thing every project starts from.",
    asserts: 4.6,
    survivesSwap: 1.4,
    palette: build({ neutral: [40, 0.012], accent: [285, 0.19], green: [155, 0.16], amber: [75, 0.165], red: [20, 0.2] }),
  },
];

export const takeById = (id: string): Take => {
  const found = TAKES.find((take) => take.id === id);
  if (!found) throw new Error(`No take with id "${id}"`);
  return found;
};

/**
 * The step-semantic contract: twelve steps, each with a job.
 *
 * Deliberately not on the eleven-stop spine — the whole claim is that steps are
 * defined by what they are *for* rather than by even lightness intervals, and
 * flattening it onto the shipped spine would erase the difference the page is
 * trying to show.
 */
const STEP_LIGHTNESS = [0.993, 0.982, 0.962, 0.94, 0.915, 0.882, 0.836, 0.768, 0.62, 0.575, 0.52, 0.3];
const STEP_CHROMA = [0.004, 0.01, 0.02, 0.03, 0.04, 0.048, 0.058, 0.078, 0.15, 0.15, 0.11, 0.055];

export const STEP_JOBS = [
  "App background",
  "Subtle background",
  "Component background",
  "Component hover",
  "Component active",
  "Subtle border",
  "Border",
  "Strong border, focus ring",
  "Solid fill",
  "Solid hover",
  "Low-contrast text",
  "High-contrast text",
] as const;

export const steps = (hue: number): string[] => STEP_LIGHTNESS.map((lightness, index) => oklch(lightness, STEP_CHROMA[index] as number, hue));
