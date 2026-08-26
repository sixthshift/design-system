import { describe, expect, it } from "vitest";

import { bumpFor, nextVersion, strongestBump } from "./next-version";

/** Commits arrive as `subject\x1fbody`. */
const commit = (subject: string, body = "") => `${subject}\x1f${body}`;

describe("bumpFor", () => {
  it.each(["feat: add Drawer", "feat(select): searchable mode"])("treats %s as a minor", (subject) => {
    expect(bumpFor(commit(subject))).toBe("minor");
  });

  it.each([
    "fix: clamp progress",
    "fix(card): padding",
    "perf: memoise day grid",
    "refactor: flatten",
    "build: tsup",
    "revert: restore the barrel export",
  ])("treats %s as a patch", (subject) => {
    expect(bumpFor(commit(subject))).toBe("patch");
  });

  it.each(["chore: bump deps", "ci: cache browsers", "docs: readme", "test: cover boundaries", "style: sort classes"])("treats %s as no release", (subject) => {
    expect(bumpFor(commit(subject))).toBeNull();
  });

  it.each(["feat!: drop React 17", "fix(temporal)!: rename export"])("treats the ! marker in %s as breaking", (subject) => {
    expect(bumpFor(commit(subject))).toBe("major");
  });

  it("treats a BREAKING CHANGE footer as breaking even on a non-feat type", () => {
    expect(bumpFor(commit("refactor: rename module", "BREAKING CHANGE: ./temporal is now ./date-time"))).toBe("major");
  });

  it("accepts the hyphenated BREAKING-CHANGE spelling", () => {
    expect(bumpFor(commit("chore: restructure", "BREAKING-CHANGE: dropped the barrel export"))).toBe("major");
  });

  it("treats a BREAKING CHANGE footer as breaking even on a type that releases nothing", () => {
    expect(bumpFor(commit("chore: restructure", "BREAKING CHANGE: dropped the barrel export"))).toBe("major");
  });

  it("still reads the footer when trailers follow it", () => {
    const body = "BREAKING CHANGE: dropped the barrel export\n\nCo-Authored-By: Someone <someone@example.com>";
    expect(bumpFor(commit("refactor: rename module", body))).toBe("major");
  });

  // Regression: `/^BREAKING CHANGE:/m` promoted commit 5a61bc8 — a `ci:` commit
  // whose prose wrapped so that "BREAKING CHANGE:" began a line mid-paragraph.
  it("ignores a wrapped mention that begins a line without opening a paragraph", () => {
    const body = "A renamed export needs feat!: or a\nBREAKING CHANGE: footer — filed as refactor: it understates.";
    expect(bumpFor(commit("ci: document the split", body))).toBeNull();
  });

  it("ignores a breaking-sounding phrase that is not a footer", () => {
    expect(bumpFor(commit("fix: stop breaking change detection", "this mentions BREAKING CHANGE mid-sentence"))).toBe("patch");
  });

  // A change that shipped unversioned is worse than one versioned too small.
  it.each(["update stuff", "Merge branch 'main'", "wip", "fix typo without a prefix"])("treats the unconventional subject %s as a patch", (subject) => {
    expect(bumpFor(commit(subject))).toBe("patch");
  });

  it("is case-insensitive about the type", () => {
    expect(bumpFor(commit("Docs: readme"))).toBeNull();
    expect(bumpFor(commit("Feat: add Drawer"))).toBe("minor");
  });
});

describe("strongestBump", () => {
  it("returns null for an empty range", () => {
    expect(strongestBump([])).toBeNull();
  });

  it("returns null when every commit releases nothing", () => {
    expect(strongestBump([commit("docs: readme"), commit("test: cover boundaries")])).toBeNull();
  });

  it("takes the strongest bump in the range, not the last", () => {
    expect(strongestBump([commit("feat: add Drawer"), commit("fix: clamp progress")])).toBe("minor");
    expect(strongestBump([commit("feat!: drop React 17"), commit("feat: add Drawer")])).toBe("major");
  });

  it("ignores unreleasable commits alongside releasable ones", () => {
    expect(strongestBump([commit("chore: bump deps"), commit("fix: clamp progress")])).toBe("patch");
  });
});

describe("nextVersion", () => {
  describe("at 1.0.0 and above", () => {
    it.each([
      ["major", "2.0.0"],
      ["minor", "1.3.0"],
      ["patch", "1.2.4"],
    ] as const)("bumps %s to %s", (bump, expected) => {
      expect(nextVersion("1.2.3", bump)).toBe(expected);
    });
  });

  describe("below 1.0.0", () => {
    it("moves the minor for a breaking change rather than declaring 1.0.0", () => {
      expect(nextVersion("0.1.0", "major")).toBe("0.2.0");
    });

    it("moves the minor for a feature", () => {
      expect(nextVersion("0.1.0", "minor")).toBe("0.2.0");
    });

    it("moves the patch for a fix", () => {
      expect(nextVersion("0.1.0", "patch")).toBe("0.1.1");
    });

    it("carries a two-digit minor rather than rolling over", () => {
      expect(nextVersion("0.9.0", "major")).toBe("0.10.0");
    });

    it("never reaches 1.0.0 automatically", () => {
      for (const bump of ["major", "minor", "patch"] as const) {
        expect(nextVersion("0.9.9", bump).startsWith("0.")).toBe(true);
      }
    });
  });
});
