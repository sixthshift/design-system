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
