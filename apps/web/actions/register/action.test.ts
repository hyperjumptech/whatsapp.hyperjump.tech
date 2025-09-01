// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { registerActionCreator } from "./index";

vi.mock("./index", () => ({
  registerActionCreator: vi.fn(() => vi.fn()),
}));

describe("register action", () => {
  it("TEST#1: should call registerActionCreator", async () => {
    const registerToTest = await import("./action").then((m) => m.register);
    expect(registerToTest).toBeDefined();
    expect(registerActionCreator).toHaveBeenCalled();
  });
});
