import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Hono } from "hono";
import { notify } from "./notify.js";

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

vi.mock("hono/logger", () => ({
  logger: vi.fn().mockImplementation((c) => c),
}));

vi.mock("@workspace/utils/multiple-contexts", async (importOriginal) => {
  const original = await importOriginal();
  return {
    // @ts-ignore
    ...original,
    withMultipleContextFunction: vi.fn().mockImplementation((_c, fn) => fn),
  };
});

vi.mock("./notify.js", () => ({
  notify: vi.fn().mockResolvedValue({
    status: 200,
    message: "Message sent",
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
      message: "Monika Whatsapp Notify API Server",
      version: "1.0.0",
    });
  });

  it("TEST#2: POST /api/notify: should return the correct response when there is an error", async () => {
    vi.mocked(notify).mockResolvedValue({
      error: "error",
      status: 400,
    });
    const res = await app.request("/api/notify?token=123", {
      method: "post",
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: "error",
      message: undefined,
      status: 400,
    });
  });

  it("TEST#2: POST /api/notify: should return the correct response when there is no error", async () => {
    vi.mocked(notify).mockResolvedValue({
      status: 200,
      message: "Message sent",
    });
    const res = await app.request("/api/notify?token=123", {
      method: "POST",
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      error: undefined,
      message: "Message sent",
      status: 200,
    });
  });

  it("TEST#3: GET /health: should return the correct response", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      status: "healthy",
      timestamp: expect.any(String),
      uptime: expect.any(Number),
    });
  });

  it("TEST#4: GET /notfound: should return the correct response", async () => {
    const res = await app.request("/notfound");
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      error: {
        message: "Endpoint not found",
      },
    });
  });

  it("TEST#5: should handle errors with correct error response format", async () => {
    // Mock the notify function to throw an error
    vi.mocked(notify).mockRejectedValue(new Error("Test error"));

    const res = await app.request("/api/notify?token=123", {
      method: "POST",
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      error: {
        message: "Internal server error",
      },
    });
  });
});
