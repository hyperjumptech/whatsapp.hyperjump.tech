import { describe, expect, it } from "vitest";
import { removeTrailingSlash } from "./url.js";

describe("removeTrailingSlash", () => {
  it("should remove the trailing slash from the url", () => {
    expect(removeTrailingSlash("https://example.com/")).toBe(
      "https://example.com"
    );
  });

  it("should not remove the trailing slash from the url if it is not present", () => {
    expect(removeTrailingSlash("https://example.com")).toBe(
      "https://example.com"
    );
  });

  it("should remove the trailing slashes from the url", () => {
    expect(removeTrailingSlash("https://example.com//")).toBe(
      "https://example.com"
    );
  });
});
