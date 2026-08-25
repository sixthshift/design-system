import { describe, expect, it } from "vitest";

import { formatBytes, formatUptime } from "./format";

describe("formatBytes", () => {
  describe("zero", () => {
    it("formats 0 bytes as '0 B'", () => {
      expect(formatBytes(0)).toBe("0 B");
    });
  });

  describe("bytes range", () => {
    it("formats a small byte count", () => {
      expect(formatBytes(500)).toBe("500.00 B");
    });

    it("formats just below the KB boundary", () => {
      expect(formatBytes(1023)).toBe("1023.00 B");
    });
  });

  describe("kilobytes range", () => {
    it("formats exactly 1024 bytes as 1.00 KB", () => {
      expect(formatBytes(1024)).toBe("1.00 KB");
    });

    it("rounds to two decimal places", () => {
      expect(formatBytes(1500)).toBe("1.46 KB");
    });

    it("handles fractional byte counts", () => {
      expect(formatBytes(1500.5)).toBe("1.47 KB");
    });
  });

  describe("megabytes range", () => {
    it("formats exactly 1024 KB as 1.00 MB", () => {
      expect(formatBytes(1024 * 1024)).toBe("1.00 MB");
    });
  });

  describe("gigabytes range", () => {
    it("formats exactly 1024 MB as 1.00 GB", () => {
      expect(formatBytes(1024 * 1024 * 1024)).toBe("1.00 GB");
    });

    it("formats a very large but still-supported byte count", () => {
      expect(formatBytes(500 * 1024 ** 3)).toBe("500.00 GB");
    });
  });
});

describe("formatUptime", () => {
  describe("under a minute", () => {
    it("formats 0 seconds as '< 1m'", () => {
      expect(formatUptime(0)).toBe("< 1m");
    });

    it("formats 30 seconds as '< 1m'", () => {
      expect(formatUptime(30)).toBe("< 1m");
    });

    it("formats 59 seconds as '< 1m'", () => {
      expect(formatUptime(59)).toBe("< 1m");
    });
  });

  describe("minutes", () => {
    it("formats exactly 60 seconds as '1m'", () => {
      expect(formatUptime(60)).toBe("1m");
    });

    it("formats 3599 seconds as '59m'", () => {
      expect(formatUptime(3599)).toBe("59m");
    });
  });

  describe("hours", () => {
    it("formats exactly one hour as '1h' (omits 0m)", () => {
      expect(formatUptime(3600)).toBe("1h");
    });

    it("formats one hour and one minute as '1h 1m'", () => {
      expect(formatUptime(3660)).toBe("1h 1m");
    });
  });

  describe("days", () => {
    it("formats exactly one day as '1d' (omits 0h 0m)", () => {
      expect(formatUptime(86400)).toBe("1d");
    });

    it("formats one day and one hour as '1d 1h' (omits 0m)", () => {
      expect(formatUptime(90000)).toBe("1d 1h");
    });

    it("formats one day, one hour, and one minute as '1d 1h 1m'", () => {
      expect(formatUptime(90061)).toBe("1d 1h 1m");
    });
  });

  describe("very large durations", () => {
    it("formats a duration spanning many days", () => {
      expect(formatUptime(1e7)).toBe("115d 17h 46m");
    });
  });

  describe("non-finite and negative input", () => {
    it("falls back to '< 1m' for negative seconds", () => {
      expect(formatUptime(-100)).toBe("< 1m");
    });

    it("falls back to '< 1m' for NaN", () => {
      expect(formatUptime(Number.NaN)).toBe("< 1m");
    });
  });
});

describe("formatBytes — previously unrepresentable input", () => {
  describe("units beyond GB", () => {
    it("formats terabytes", () => {
      expect(formatBytes(1024 ** 4)).toBe("1.00 TB");
    });

    it("formats petabytes", () => {
      expect(formatBytes(1024 ** 5)).toBe("1.00 PB");
    });

    it("stays in the largest unit rather than running off the unit list", () => {
      // PB already exceeds Number.MAX_SAFE_INTEGER bytes, so anything larger
      // should still render a number, not "undefined".
      const result = formatBytes(1024 ** 6);
      expect(result).toBe("1024.00 PB");
      expect(result).not.toContain("undefined");
    });

    it.each([1024 ** 4, 1024 ** 5, 1024 ** 6, Number.MAX_SAFE_INTEGER])("never renders undefined for %d", (value) => {
      expect(formatBytes(value)).not.toContain("undefined");
    });
  });

  describe("values below one byte", () => {
    it("stays in bytes rather than computing a negative unit index", () => {
      expect(formatBytes(0.5)).toBe("0.50 B");
    });

    it("handles a very small fraction", () => {
      expect(formatBytes(0.001)).toBe("0.00 B");
    });
  });

  describe("negative values", () => {
    it("formats the magnitude with a leading sign", () => {
      expect(formatBytes(-1536)).toBe("-1.50 KB");
    });

    it("scales negative values through the units", () => {
      expect(formatBytes(-(1024 ** 3))).toBe("-1.00 GB");
    });

    it("handles a negative fraction of a byte", () => {
      expect(formatBytes(-0.5)).toBe("-0.50 B");
    });

    it("never renders NaN for a negative value", () => {
      expect(formatBytes(-1)).not.toContain("NaN");
    });
  });

  describe("non-finite input", () => {
    it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])("returns an em dash for %p", (value) => {
      expect(formatBytes(value)).toBe("—");
    });

    it("does not claim a numeric value it cannot represent", () => {
      expect(formatBytes(Number.NaN)).not.toContain("0");
      expect(formatBytes(Number.NaN)).not.toContain("NaN");
    });
  });

  describe("boundaries stay exact", () => {
    it.each([
      [1023, "1023.00 B"],
      [1024, "1.00 KB"],
      [1024 ** 2 - 1, "1024.00 KB"],
      [1024 ** 2, "1.00 MB"],
      [1024 ** 3, "1.00 GB"],
    ])("formats %d as %s", (input, expected) => {
      expect(formatBytes(input)).toBe(expected);
    });
  });
});
