import { describe, it, expect, vi } from "vitest";
import { isDebugEnabled } from "./debug.js";
import { env } from "@workspace/env";

vi.mock("@workspace/env", () => ({
  env: {
    DEBUG: "notify-api",
  },
}));

describe("isDebugEnabled", () => {
  it("should return true if DEBUG includes notify-api", () => {
    expect(isDebugEnabled()).toBe(true);
  });

  it("should return false if DEBUG does not include notify-api", () => {
    vi.mocked(env).DEBUG = "web";
    expect(isDebugEnabled()).toBe(false);
  });
});
