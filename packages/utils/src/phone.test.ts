import { normalizePhone } from "./phone.js";
import { describe, it, expect } from "vitest";

describe("normalizePhone", () => {
  it("TEST#1 should return the phone number if it starts with +", () => {
    expect(normalizePhone("+123456789")).toBe("+123456789");
  });

  it("TEST#2 should return the phone number if it starts with 0", () => {
    expect(normalizePhone("0123456789")).toBe("+123456789");
  });

  it("TEST#3 should return the phone number if it starts with a number", () => {
    expect(normalizePhone("123456789")).toBe("+123456789");
  });
});
