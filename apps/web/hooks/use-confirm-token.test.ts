import { act, renderHook, waitFor } from "@testing-library/react";
import { expect, test, vi, describe, beforeEach, afterEach } from "vitest";
import { useConfirmToken } from "./use-confirm-token";
import { notFound, useParams } from "next/navigation";
import { confirmToken } from "@/actions/confirm-token/action";

// Mock Next.js navigation hooks
vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
  useSearchParams: vi.fn(),
  usePathname: vi.fn(),
  useParams: vi.fn(),
}));

vi.mock("@/actions/confirm-token/action", () => ({
  confirmToken: vi.fn(),
}));

describe("useConfirmToken", () => {
  beforeEach(() => {
    vi.mocked(useParams).mockReturnValue({});
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("TEST#1: should return the token", () => {
    vi.mocked(useParams).mockReturnValue({ token: "123" });
    const { result } = renderHook(() => useConfirmToken());
    expect(result.current.token).toBe("123");
  });

  test("TEST#2: should show 404 error if no token is provided", () => {
    renderHook(() => useConfirmToken());
    expect(notFound).toHaveBeenCalled();
  });

  test("TEST#3: should call the confirmToken action", async () => {
    vi.mocked(useParams).mockReturnValue({ token: "123" });
    vi.mocked(confirmToken).mockResolvedValue({ error: "Error" } as any);

    const { result } = renderHook(() => useConfirmToken());
    await act(async () => {
      result.current.confirmToken();
    });
    expect(confirmToken).toHaveBeenCalledWith({ token: "123" });
  });

  test("TEST#4: should set the error if the confirmToken action fails", async () => {
    vi.mocked(confirmToken).mockResolvedValue({ error: "Error" } as any);
    const { result } = renderHook(() => useConfirmToken());
    await act(async () => {
      result.current.confirmToken();
    });
    expect(result.current.error).toBe("Error");
  });

  test("TEST#5: should set the pending state to true when the confirmToken action is called", async () => {
    let resolvePromise: (value?: { error: string }) => void;

    const deferredPromise: Promise<{ error: string } | undefined> = new Promise(
      (resolve) => {
        resolvePromise = resolve;
      }
    );

    // mock the confirmToken action with a controlled promise
    vi.mocked(confirmToken).mockImplementation(() => {
      return deferredPromise as Promise<{ error: string }>;
    });

    const { result } = renderHook(() => useConfirmToken());

    // Start the register operation
    act(() => {
      result.current.confirmToken();
    });

    // Verify isPendingRegister is true while promise is pending
    expect(result.current.pending).toBe(true);

    // Now resolve the promise
    act(() => {
      resolvePromise({ error: "Register Error" });
    });

    // Wait for the state to update after promise resolution
    await waitFor(() => {
      expect(result.current.pending).toBe(false);
    });
  });
});
