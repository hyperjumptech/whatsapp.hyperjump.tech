import { describe, it, expect, vi } from "vitest";
import { isDebugEnabled } from "./debug.js";
import { env } from "@workspace/env";

vi.mock("@workspace/env", () => ({
  env: {
    DEBUG: "facebook-webhooks",
  },
}));

describe("isDebugEnabled", () => {
  it("should return true if DEBUG includes facebook-webhooks", () => {
    expect(isDebugEnabled()).toBe(true);
  });

  it("should return false if DEBUG does not include facebook-webhooks", () => {
    vi.mocked(env).DEBUG = "web";
    expect(isDebugEnabled()).toBe(false);
  });
});
