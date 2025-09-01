// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { deleteTokenActionCreator } from "./index";

vi.mock("./index", () => ({
  deleteTokenActionCreator: vi.fn(() => vi.fn()),
}));

describe("deleteToken action", () => {
  it("TEST#1: should call deleteTokenActionCreator", async () => {
    const deleteTokenToTest = await import("./action").then(
      (m) => m.deleteToken
    );
    expect(deleteTokenToTest).toBeDefined();
    expect(deleteTokenActionCreator).toHaveBeenCalled();
  });
});
