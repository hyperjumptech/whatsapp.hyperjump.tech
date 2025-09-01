// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { testWebhookActionCreator } from "./index";

vi.mock("./index", () => ({
  testWebhookActionCreator: vi.fn(() => vi.fn()),
}));

describe("test-webhook action", () => {
  it("TEST#1: should call testWebhookActionCreator", async () => {
    const testWebhookToTest = await import("./action").then(
      (m) => m.testWebhook
    );
    expect(testWebhookToTest).toBeDefined();
    expect(testWebhookActionCreator).toHaveBeenCalled();
  });
});
