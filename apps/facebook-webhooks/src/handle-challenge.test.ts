import { describe, it, expect, vi } from "vitest";
import { handleChallenge } from "./handle-challenge.js";

vi.mock("@workspace/env", () => ({
  env: {
    FACEBOOK_WEBHOOK_VERIFY_TOKEN: "test",
  },
}));

describe("handleChallenge", () => {
  it("TEST#1: should return 400 if the token is invalid", async () => {
    const queries = {
      "hub.mode": "subscribe",
      "hub.challenge": "123",
    };
    const result = await handleChallenge(queries);
    expect(result).toEqual({
      status: 400,
      message: "Invalid token",
    });
  });

  it("TEST#2: should return 200 if the token is valid", async () => {
    const queries = {
      "hub.mode": "subscribe",
      "hub.verify_token": "test",
      "hub.challenge": "123",
    };
    const result = await handleChallenge(queries);
    expect(result).toEqual({
      status: 200,
      message: "123",
    });
  });

  it("TEST#3: should return 400 if the mode is invalid", async () => {
    const queries = {
      "hub.mode": "invalid",
      "hub.verify_token": "test",
      "hub.challenge": "123",
    };
    const result = await handleChallenge(queries);
    expect(result).toEqual({
      status: 400,
      message: "Invalid token",
    });
  });

  it("TEST#3: should return 400 if the verify token is invalid", async () => {
    const queries = {
      "hub.mode": "subscribe",
      "hub.verify_token": "invalid",
      "hub.challenge": "123",
    };

    const result = await handleChallenge(queries);
    expect(result).toEqual({
      status: 400,
      message: "Invalid token",
    });
  });
});
