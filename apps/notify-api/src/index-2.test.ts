/**
 * To test the TEST#6 in index.ts, we need to separate the test from the rest of the tests. This is because to mock isDebugEnabled, we need to mock it very early. Once the app is imported, we cannot change the mocked return value anymore. If you know how to change the mocked return value after the app is imported, please let me know.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isDebugEnabled } from "./utils/debug.js";
import { logger } from "hono/logger";

vi.mock("@hono/node-server", () => ({
  serve: vi.fn().mockImplementation((app) => {
    return {
      listen: vi.fn().mockImplementation((port) => {}),
    };
  }),
}));

vi.mock("./utils/debug.js", () => ({
  // this is important for this test to pass
  isDebugEnabled: vi.fn().mockReturnValue(true),
}));

vi.mock("hono/logger", () => ({
  logger: vi.fn().mockImplementation((c) => c),
}));

vi.mock("@workspace/utils/multiple-contexts", async (importOriginal) => {
  const original = await importOriginal();
  return {
    // @ts-ignore
    ...original,
    withMultipleContextFunction: vi.fn().mockImplementation((fn) => fn),
  };
});

describe("index-2", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("TEST#6: should use logger when debug is enabled", async () => {
    vi.mocked(isDebugEnabled).mockReturnValue(true);
    const theApp = await import("./index.js").then((m) => m.default);
    await theApp.request("/");
    expect(vi.mocked(logger)).toHaveBeenCalled();
  });
});
