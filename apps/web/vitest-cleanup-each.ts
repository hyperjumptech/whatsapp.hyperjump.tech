import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, vi } from "vitest";

// Set environment variables to suppress Prisma logs during tests
beforeAll(() => {
  process.env.PRISMA_LOG_LEVEL = "warn";
  process.env.DEBUG = "";
  process.env.VITEST = "true";

  // Mock window.matchMedia for next-themes compatibility
  if (typeof window !== "undefined") {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  }
});

afterEach(() => {
  cleanup();
});
