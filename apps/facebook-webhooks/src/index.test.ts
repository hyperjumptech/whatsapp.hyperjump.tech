import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { handleChallenge } from "./handle-challenge.js";
import { webhookFacebook } from "./webhook-facebook.js";
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
  webhookFacebook: vi.fn().mockReturnValue({ status: 200, message: "OK" }),
}));

vi.mock("./utils/debug.js", () => ({
  isDebugEnabled: vi.fn().mockReturnValue(false),
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

  it("TEST#1: GET /: should return the correct response", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      message: "Facebook Webhooks Server",
      version: "1.0.0",
    });
  });

  it("TEST#2: GET /api/webhook/facebook: should return the correct response", async () => {
    vi.mocked(handleChallenge).mockResolvedValue({
      status: 400,
      message: "Bad Request",
    });
    const res = await app.request("/api/webhook/facebook");
    expect(res.status).toBe(400);
    expect(await res.text()).toBe("Bad Request");
  });

  it("TEST#3: POST /api/webhook/facebook: should return the correct response when there is an error", async () => {
    vi.mocked(webhookFacebook).mockResolvedValue({
      error: "error",
      status: 400,
    });
    const res = await app.request("/api/webhook/facebook", {
      method: "POST",
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "error" });
  });

  it("TEST#4: POST /api/webhook/facebook: should return the correct response when there is no error", async () => {
    vi.mocked(webhookFacebook).mockResolvedValue({
      status: 200,
    });
    const res = await app.request("/api/webhook/facebook", {
      method: "POST",
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("OK");
  });

  it("TEST#5: GET /health: should return the correct response", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      status: "healthy",
      timestamp: expect.any(String),
      uptime: expect.any(Number),
      webhookLogs: 0,
    });
  });

  it("TEST#6: GET /notfound: should return the correct response", async () => {
    const res = await app.request("/notfound");
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      error: {
        message: "Endpoint not found",
      },
    });
  });

  it("TEST#7: should handle errors with correct error response format", async () => {
    // Mock the notify function to throw an error
    vi.mocked(handleChallenge).mockRejectedValue(new Error("Test error"));

    const res = await app.request("/api/webhook/facebook", {
      method: "GET",
    });

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      error: {
        message: "Internal server error",
      },
    });
  });
});
