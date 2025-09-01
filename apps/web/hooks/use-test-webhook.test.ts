import { act, renderHook, waitFor } from "@testing-library/react";
import { expect, test, vi, describe, afterEach } from "vitest";
import { useTestWebhook } from "./use-test-webhook";
import { testWebhook } from "@/actions/test-webhook/action";

// Mock Next.js navigation hooks
vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => ({
    get: (key: string) => {
      if (key === "tab") return "register";
      return null;
    },
  })),
}));

vi.mock("@/actions/test-webhook/action", () => ({
  testWebhook: vi.fn(),
}));

vi.mock("@workspace/env", () => ({
  env: {
    NEXT_PUBLIC_BASE_URL: "https://example.com",
    NEXT_PUBLIC_MONIKA_NOTIFY_API_URL: "https://example.com",
  },
}));

describe("useTestWebhook", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("TEST#1: should set and return URL", () => {
    // setup
    const { result } = renderHook(() => useTestWebhook());

    // execute
    act(() => {
      result.current.setUrl("https://example.com");
    });

    // expectations
    expect(result.current.url).toBe("https://example.com");
  });

  test("TEST#2: should set and return type", () => {
    // setup
    const { result } = renderHook(() => useTestWebhook());
    act(() => {
      result.current.setUrl("https://example.com");
    });

    // execute
    act(() => {
      result.current.setType("start");
    });
  });

  test("TEST#3: submitTestWebhook should set error message if URL is invalid", () => {
    // setup
    const { result } = renderHook(() => useTestWebhook());
    act(() => {
      result.current.setUrl("https://something");
    });

    // execute
    act(() => {
      result.current.submitTestWebhook();
    });
    // expectations
    expect(result.current.errorMessage).toBe(
      "Please provide a valid Webhook URL: https://example.com/api/notify?token=YOUR_TOKEN"
    );
  });

  test("TEST#4: submitTestWebhook should set error message if token is not found", () => {
    // setup
    const { result } = renderHook(() => useTestWebhook());
    act(() => {
      result.current.setUrl("https://example.com/api/notify?token=");
    });
    act(() => {
      result.current.submitTestWebhook();
    });
    // expectations
    expect(result.current.errorMessage).toBe("Token is required");
  });

  test("TEST#5: submitTestWebhook should set pending to true", async () => {
    // setup
    let resolvePromise: (value?: { error: string }) => void;

    const deferredPromise: Promise<{ error: string } | undefined> = new Promise(
      (resolve) => {
        resolvePromise = resolve;
      }
    );

    // mock the testWebhook action with a controlled promise
    vi.mocked(testWebhook).mockImplementation(() => {
      return deferredPromise;
    });

    // act
    const { result } = renderHook(() => useTestWebhook());
    act(() => {
      result.current.setUrl("https://example.com/api/notify?token=123");
    });
    act(() => {
      result.current.submitTestWebhook();
    });
    // expectations
    expect(result.current.pending).toBe(true);

    act(() => {
      resolvePromise({ error: "Resend Error" });
    });

    await waitFor(() => {
      expect(result.current.pending).toBe(false);
    });

    expect(result.current.errorMessage).toBe("Resend Error");
  });
});
