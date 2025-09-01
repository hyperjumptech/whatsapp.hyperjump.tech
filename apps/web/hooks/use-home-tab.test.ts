import { renderHook } from "@testing-library/react";
import { expect, test, vi, describe, beforeEach, afterEach } from "vitest";
import {
  ReadonlyURLSearchParams,
  usePathname,
  useSearchParams,
} from "next/navigation";
import { useHomeTab } from "./use-home-tab";
import { notFound } from "next/navigation";

// Mock Next.js navigation hooks
vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
  useSearchParams: vi.fn(),
  usePathname: vi.fn(),
}));

describe("useHomeTab", () => {
  beforeEach(() => {
    // Set up fresh mocks for each test
    vi.mocked(usePathname).mockReturnValue("/");
    vi.mocked(useSearchParams).mockReturnValue({
      get: () => null,
    } as unknown as ReadonlyURLSearchParams);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("TEST#1: should return the default current tab", () => {
    // setup
    vi.mocked(useSearchParams).mockReturnValue({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      get: (key: string) => {
        return null;
      },
    } as unknown as ReadonlyURLSearchParams);

    // execute
    const { result } = renderHook(() => useHomeTab());

    // expectations
    expect(result.current.tab).toBe("register");
  });

  test("TEST#1: should set the right current tab", () => {
    // setup
    vi.mocked(useSearchParams).mockReturnValue({
      get: (key: string) => {
        if (key === "tab") return "resend-instruction";
        return null;
      },
    } as unknown as ReadonlyURLSearchParams);

    // execute
    const { result } = renderHook(() => useHomeTab());

    // expectations
    expect(result.current.tab).toBe("resend-instruction");
  });

  test("TEST#1: should set the right current tab for test-webhook", () => {
    // setup
    vi.mocked(useSearchParams).mockReturnValue({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      get: (key: string) => {
        return null;
      },
    } as unknown as ReadonlyURLSearchParams);
    vi.mocked(usePathname).mockReturnValue("/test-webhook");

    // execute
    const { result } = renderHook(() => useHomeTab());

    // expectations
    expect(result.current.tab).toBe("test-webhook");
  });

  test("TEST#2: should return the right isActive for tab", () => {
    // setup
    vi.mocked(useSearchParams).mockReturnValue({
      get: (key: string) => {
        if (key === "tab") return "resend-instruction";
        return null;
      },
    } as unknown as ReadonlyURLSearchParams);

    // execute
    const { result } = renderHook(() => useHomeTab());

    // expectations
    expect(result.current.isActive("register")).toBe(false);
    expect(result.current.isActive("resend-instruction")).toBe(true);

    // setup
    vi.mocked(useSearchParams).mockReturnValue({
      get: (key: string) => {
        return null;
      },
    } as unknown as ReadonlyURLSearchParams);

    vi.mocked(usePathname).mockReturnValue("/test-webhook");

    // execute
    const { result: result2 } = renderHook(() => useHomeTab());

    // expectations
    expect(result2.current.isActive("test-webhook")).toBe(true);
  });

  test("TEST#3: should return the right link for tab", () => {
    // execute
    const { result } = renderHook(() => useHomeTab());

    // expectations
    expect(result.current.linkForTab("register")).toBe("/?tab=register");
    expect(result.current.linkForTab("resend-instruction")).toBe(
      "/?tab=resend-instruction"
    );
    expect(result.current.linkForTab("test-webhook")).toBe("/test-webhook");
  });

  test("TEST#4: should show 404 if the tab is not valid", () => {
    // setup
    vi.mocked(useSearchParams).mockReturnValue({
      get: (key: string) => {
        if (key === "tab") return "invalid-tab";
        return null;
      },
    } as unknown as ReadonlyURLSearchParams);

    // execute
    renderHook(() => useHomeTab());

    // expectations
    expect(notFound).toHaveBeenCalled();
  });
});
