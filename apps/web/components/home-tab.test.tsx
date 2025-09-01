import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { expect, test, vi, describe, afterEach } from "vitest";
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import HomeTab from "./home-tab";

// Mock Next.js navigation hooks
vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => ({
    get: (key: string) => {
      if (key === "tab") return "register";
      return null;
    },
  })),
  usePathname: vi.fn(() => "/"),
}));

describe("HomeTab", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("TEST#1: should render the register tab", () => {
    vi.mocked(useSearchParams).mockReturnValue({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      get: (key: string) => {
        return null;
      },
    } as unknown as ReadonlyURLSearchParams);

    render(<HomeTab />);
    expect(screen.getByText("Register")).toBeInTheDocument();
  });

  test("TEST#1.1: should render the register tab as active", async () => {
    const { getByText } = render(<HomeTab />);
    const registerElement = getByText("Register");

    // Assert it doesn't have href attribute (which links have)
    expect(registerElement).not.toHaveAttribute("href");

    const resendInstructionElement = getByText("Resend Instruction");
    expect(resendInstructionElement).toHaveAttribute("href");
  });

  test("TEST#2: should render the resend instruction tab", () => {
    render(<HomeTab />);
    expect(screen.getByText("Resend Instruction")).toBeInTheDocument();
  });

  test("TEST#2.1: should render the resend instruction tab as active", async () => {
    vi.mocked(useSearchParams).mockReturnValue({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      get: (key: string) => {
        return "resend-instruction";
      },
    } as unknown as ReadonlyURLSearchParams);

    const { getByText } = render(<HomeTab />);
    const resendInstructionElement = getByText("Resend Instruction");

    // Assert it doesn't have href attribute (which links have)
    expect(resendInstructionElement).not.toHaveAttribute("href");

    const registerElement = getByText("Register");
    expect(registerElement).toHaveAttribute("href");
  });

  test("TEST#3: should render the test webhook tab", () => {
    render(<HomeTab />);
    expect(screen.getByText("Test Webhook")).toBeInTheDocument();
  });

  test("TEST#3.1: should render the test webhook tab as active", async () => {
    vi.mocked(useSearchParams).mockReturnValue({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      get: (key: string) => {
        return "test-webhook";
      },
    } as unknown as ReadonlyURLSearchParams);

    const { getByText } = render(<HomeTab />);
    const testWebhookElement = getByText("Test Webhook");

    // Assert it doesn't have href attribute (which links have)
    expect(testWebhookElement).not.toHaveAttribute("href");

    const registerElement = getByText("Register");
    expect(registerElement).toHaveAttribute("href");
  });
});
