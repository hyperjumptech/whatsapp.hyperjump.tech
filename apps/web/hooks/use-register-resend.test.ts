import { act, renderHook, waitFor } from "@testing-library/react";
import { expect, test, vi, describe, afterEach } from "vitest";
import { useRegisterResend, validateData } from "./use-register-resend";
import { resend } from "@/actions/resend/action";
import { register } from "@/actions/register/action";
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";

// Mock Next.js navigation hooks
vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => ({
    get: (key: string) => {
      if (key === "tab") return "register";
      return null;
    },
  })),
}));

// Mock the actions
vi.mock("@/actions/register/action", () => ({
  register: vi.fn(),
}));

vi.mock("@/actions/resend/action", () => ({
  resend: vi.fn(),
}));

describe("useRegisterResend", () => {
  afterEach(() => {
    vi.resetAllMocks();
    vi.clearAllMocks();
  });

  test("TEST#1: should set phone number", async () => {
    const { result } = renderHook(() => useRegisterResend());

    await act(async () => {
      result.current.setDataForKey("phone", "1234567890");
    });

    expect(result.current.data.phone).toBe("1234567890");
  });

  test("TEST#1: should set name", async () => {
    const { result } = renderHook(() => useRegisterResend());

    await act(async () => {
      result.current.setDataForKey("name", "John Doe");
    });

    expect(result.current.data.name).toBe("John Doe");
  });

  test("TEST#2: should clear errors", async () => {
    const { result } = renderHook(() => useRegisterResend());

    // First set some errors
    await act(async () => {
      result.current.setErrorForKey("name", "Name error");
      result.current.setErrorForKey("phone", "Phone error");
    });

    expect(result.current.errors.name).toBe("Name error");
    expect(result.current.errors.phone).toBe("Phone error");

    // Then clear them
    await act(async () => {
      result.current.clearErrors();
    });

    expect(result.current.errors.name).toBe("");
    expect(result.current.errors.phone).toBe("");
  });

  test("TEST#3: should have correct initial state", async () => {
    const { result } = renderHook(() => useRegisterResend());

    expect(result.current.data.name).toBe("");
    expect(result.current.data.phone).toBe("");
    expect(result.current.tab).toBe("register");
    expect(result.current.isPendingRegister).toBe(false);
    expect(result.current.isPendingResend).toBe(false);
  });

  test("TEST#4: should set error for name", async () => {
    const { result } = renderHook(() => useRegisterResend());

    await act(async () => {
      result.current.setErrorForKey("name", "Name error");
    });

    expect(result.current.errors.name).toBe("Name error");
  });

  test("TEST#4: should set error for phone", async () => {
    const { result } = renderHook(() => useRegisterResend());

    await act(async () => {
      result.current.setErrorForKey("phone", "Phone error");
    });

    expect(result.current.errors.phone).toBe("Phone error");
  });

  test("TEST#5: should handle register", async () => {
    vi.mocked(register).mockResolvedValue({
      error: "Error",
    });

    const { result } = renderHook(() => useRegisterResend());

    // Set some data to pass validation
    await act(async () => {
      result.current.setDataForKey("name", "John Doe");
      result.current.setDataForKey("phone", "1234567890");
    });

    // Call handleRegister
    await act(async () => {
      result.current.handleRegister();
    });

    expect(result.current.errors.register).toBe("Error");
  });

  test("TEST#5.1: should set isPendingRegister to true", async () => {
    let resolvePromise: (value?: { error: string }) => void;

    const deferredPromise: Promise<{ error: string } | undefined> = new Promise(
      (resolve) => {
        resolvePromise = resolve;
      }
    );

    // mock the register action with a controlled promise
    vi.mocked(register).mockImplementation(() => {
      return deferredPromise;
    });

    const { result } = renderHook(() => useRegisterResend());

    // Set some data to pass validation
    await act(async () => {
      result.current.setDataForKey("name", "John Doe");
      result.current.setDataForKey("phone", "1234567890");
    });

    // Start the register operation
    act(() => {
      result.current.handleRegister();
    });

    // Verify isPendingRegister is true while promise is pending
    expect(result.current.isPendingRegister).toBe(true);
    expect(result.current.isPendingResend).toBe(false);

    // Now resolve the promise
    act(() => {
      resolvePromise({ error: "Register Error" });
    });

    // Wait for the state to update after promise resolution
    await waitFor(() => {
      expect(result.current.isPendingRegister).toBe(false);
    });
  });

  test("TEST#6: should handle resend", async () => {
    vi.mocked(resend).mockResolvedValue({
      error: "Resend Error",
    });

    const { result } = renderHook(() => useRegisterResend());

    // Set some data to pass validation
    await act(async () => {
      result.current.setDataForKey("name", "John Doe");
      result.current.setDataForKey("phone", "1234567890");
    });

    // Call handleResend
    await act(async () => {
      result.current.handleResend();
    });

    expect(result.current.errors.resend).toBe("Resend Error");
  });

  test("TEST#6.1: should set isPendingResend to true", async () => {
    let resolvePromise: (value?: { error: string }) => void;

    const deferredPromise: Promise<{ error: string } | undefined> = new Promise(
      (resolve) => {
        resolvePromise = resolve;
      }
    );

    // mock the resend action with a controlled promise
    vi.mocked(resend).mockImplementation(() => {
      return deferredPromise;
    });

    const { result } = renderHook(() => useRegisterResend());

    // Set some data to pass validation
    await act(async () => {
      result.current.setDataForKey("name", "John Doe");
      result.current.setDataForKey("phone", "1234567890");
    });

    // Start the resend operation
    act(() => {
      result.current.handleResend();
    });

    // Verify isPendingResend is true while promise is pending
    expect(result.current.isPendingResend).toBe(true);

    // Now resolve the promise
    act(() => {
      resolvePromise({ error: "Resend Error" });
    });

    // Wait for the state to update after promise resolution
    await waitFor(() => {
      expect(result.current.isPendingResend).toBe(false);
    });
  });

  test("TEST#7: should return default tab", async () => {
    const { result } = renderHook(() => useRegisterResend());

    expect(result.current.tab).toBe("register");
  });

  test("TEST#8: should return correct tab", async () => {
    vi.mocked(useSearchParams).mockReturnValue({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      get: (_key: string) => {
        return "resend-instruction";
      },
    } as ReadonlyURLSearchParams);

    const { result } = renderHook(() => useRegisterResend());

    expect(result.current.tab).toBe("resend-instruction");
  });

  test("TEST#9: validateData should return error when name is less than 3 characters ", async () => {
    const data = { name: "Jo", phone: "1234567890" };
    const errors = validateData(data, "register");

    expect(errors?.name).toBe("Name must be at least 3 characters");
  });

  test("TEST#10: validateData should return error when phone is less than 10 characters", async () => {
    const data = { name: "John Doe", phone: "123456789" };
    const errors = validateData(data, "register");

    expect(errors?.phone).toBe("Phone must be at least 10 characters");
  });

  test("TEST#11: validateData should return undefined when data is valid", async () => {
    const data = { name: "John Doe", phone: "1234567890" };
    const errors = validateData(data, "register");

    expect(errors).toBeUndefined();
  });

  test("TEST#12: should clear errors when the tab changes", async () => {
    const { result, rerender } = renderHook(() => useRegisterResend());

    await act(async () => {
      result.current.setErrorForKey("register", "Register error");
    });

    expect(result.current.errors.register).toBe("Register error");

    vi.mocked(useSearchParams).mockReturnValue({
      get: (_key: string) => {
        return "resend-instruction";
      },
    } as ReadonlyURLSearchParams);

    // trigger the useEffect by re-rendering the hook
    rerender();

    expect(result.current.errors.register).toBe("");
  });
});
