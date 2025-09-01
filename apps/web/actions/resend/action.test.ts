// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { resendActionCreator } from "./index";

vi.mock("./index", () => ({
  resendActionCreator: vi.fn(() => vi.fn()),
}));

describe("resend action", () => {
  it("TEST#1: should call resendActionCreator", async () => {
    const resendToTest = await import("./action").then((m) => m.resend);
    expect(resendToTest).toBeDefined();
    expect(resendActionCreator).toHaveBeenCalled();
  });
});
