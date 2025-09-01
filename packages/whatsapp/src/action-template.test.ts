import { describe, it, expect } from "vitest";
import { paramsForAction } from "./action-template.js";

describe("actionTemplate", () => {
  it("TEST#1: should return the correct params for confirmation", () => {
    const params = paramsForAction({
      type: "confirmation",
      input: { name: "test", activationLink: "test2", expiredAt: "test3" },
    });
    expect(params).toStrictEqual(["test", "test2", "test3"]);
  });

  it("TEST#2: should return the correct params for instruction", () => {
    const params = paramsForAction({
      type: "instruction",
      input: {
        notifyWebhookUrl: "test2",
        docsUrl: "test3",
        deleteWebhookUrl: "test4",
      },
    });
    expect(params).toStrictEqual(["test2", "test2", "test3", "test4"]);
  });

  it("TEST#3: should return the correct params for start", () => {
    const params = paramsForAction({
      type: "start",
      input: { ipAddress: "test2" },
    });
    expect(params).toStrictEqual(["test2"]);
  });

  it("TEST#4: should return the correct params for incident", () => {
    const params = paramsForAction({
      type: "incident",
      input: { alert: "test2", url: "test3", time: "test4", monika: "test5" },
    });
    expect(params).toStrictEqual(["test2", "test3", "test4", "test5"]);
  });

  it("TEST#5: should return the correct params for recovery", () => {
    const params = paramsForAction({
      type: "recovery",
      input: { alert: "test2", url: "test3", time: "test4", monika: "test5" },
    });
    expect(params).toStrictEqual(["test2", "test3", "test4", "test5"]);
  });

  it("TEST#6: should return the correct params for incident-symon", () => {
    const params = paramsForAction({
      type: "incident-symon",
      input: { alert: "test2", url: "test3", time: "test4", monika: "test5" },
    });
    expect(params).toStrictEqual(["test2", "test3", "test4", "test5"]);
  });
});
