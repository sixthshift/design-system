/// <reference types="@testing-library/jest-dom" />
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

// Mock scrollTo for TimeColumn component (used in TimePicker and DateTimePicker)
Element.prototype.scrollTo = vi.fn();

// Mock ResizeObserver (not available in happy-dom)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

afterEach(() => {
  cleanup();
});
