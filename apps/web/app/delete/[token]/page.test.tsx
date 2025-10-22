// @vitest-environment node
import { withDbContext } from "@/lib/context/db";
import { describe, expect, test, vi } from "vitest";

vi.mock("@/lib/context/db", () => ({
  withDbContext: vi.fn().mockImplementation((Component) => Component),
}));
vi.mock("@workspace/env", () => ({
  env: {
    NEXT_PUBLIC_BASE_URL: "https://webhook.site",
  },
}));

describe("DeletePage", () => {
  test("should wrap the DeletePage with db context", async () => {
    const defaultImport = await import("./page").then((m) => m.default);
    expect(defaultImport).toBeDefined();
    expect(withDbContext).toHaveBeenCalledWith(defaultImport);
  });
});
