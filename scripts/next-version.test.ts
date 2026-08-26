import { describe, expect, it } from "vitest";

import { bumpFor, nextVersion } from "./next-version";

/** Commits arrive as `subject\x1fbody`. */
const commit = (subject: string, body = "") => `${subject}\x1f${body}`;

describe("bumpFor", () => {
  it.each(["feat: add Drawer", "feat(select): searchable mode"])("treats %s as a minor", (subject) => {
    expect(bumpFor(commit(subject))).toBe("minor");
  });

  it.each(["fix: clamp progress", "fix(card): padding", "perf: memoise day grid"])("treats %s as a patch", (subject) => {
    expect(bumpFor(commit(subject))).toBe("patch");
  });

  it.each([
    "chore: bump deps",
    "ci: cache browsers",
    "docs: readme",
    "test: cover boundaries",
    "refactor: flatten",
    "style: sort classes",
    "build: tsup",
  ])("treats %s as no release", (subject) => {
    expect(bumpFor(commit(subject))).toBe("none");
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

  it("ignores a breaking-sounding phrase that is not a footer", () => {
    expect(bumpFor(commit("fix: stop breaking change detection", "this mentions BREAKING CHANGE mid-sentence"))).toBe("patch");
  });

  it("returns none for a subject with no conventional prefix", () => {
    expect(bumpFor(commit("update stuff"))).toBe("none");
  });
});

describe("nextVersion", () => {
  it("returns null when nothing warrants a release", () => {
    expect(nextVersion("1.2.3", "none")).toBeNull();
  });

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

    it("never reaches 1.0.0 automatically", () => {
      for (const bump of ["major", "minor", "patch"] as const) {
        expect(nextVersion("0.9.9", bump)?.startsWith("0.")).toBe(true);
      }
    });
  });
});
