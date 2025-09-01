// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { confirmTokenActionCreator } from "./index";

vi.mock("./index", () => ({
  confirmTokenActionCreator: vi.fn(() => vi.fn()),
}));

describe("confirmToken action", () => {
  it("TEST#1: should call confirmTokenActionCreator", async () => {
    const confirmTokenToTest = await import("./action").then(
      (m) => m.confirmToken
    );
    expect(confirmTokenToTest).toBeDefined();
    expect(confirmTokenActionCreator).toHaveBeenCalled();
  });
});
