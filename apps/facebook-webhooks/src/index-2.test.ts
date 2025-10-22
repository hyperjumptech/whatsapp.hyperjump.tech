/**
 * To test the TEST#6 in index.ts, we need to separate the test from the rest of the tests. This is because to mock isDebugEnabled, we need to mock it very early. Once the app is imported, we cannot change the mocked return value anymore. If you know how to change the mocked return value after the app is imported, please let me know.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isDebugEnabled } from "./utils/debug.js";
import { logger } from "hono/logger";
import { Hono } from "hono";

vi.mock("@hono/node-server", () => ({
  serve: vi.fn().mockImplementation((app) => {
    return {
      listen: vi.fn().mockImplementation((port) => {}),
    };
  }),
}));

vi.mock("./utils/debug.js", () => ({
  isDebugEnabled: vi.fn().mockReturnValue(false),
}));

vi.mock("./handle-challenge.js", () => ({
  handleChallenge: vi.fn().mockResolvedValue({ status: 200, message: "OK" }),
}));

vi.mock("./webhook-facebook.js", () => ({
  webhookFacebook: vi.fn().mockResolvedValue({ status: 200, message: "OK" }),
}));

vi.mock("./utils/debug.js", () => ({
  isDebugEnabled: vi.fn().mockReturnValue(true),
}));

vi.mock("hono/logger", () => ({
  logger: vi.fn().mockImplementation((c) => c),
}));

vi.mock("@workspace/database/context", () => ({
  withDbContextFunction: vi.fn().mockImplementation((fn) => fn),
  getDbContext: vi.fn().mockReturnValue({
    prisma: {
      webhook_logs: {
        count: vi.fn().mockResolvedValue(0),
      },
    },
  }),
}));

describe("index", () => {
  let app: Hono;
  beforeEach(async () => {
    app = await import("./index.js").then((m) => m.default);
  });
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
