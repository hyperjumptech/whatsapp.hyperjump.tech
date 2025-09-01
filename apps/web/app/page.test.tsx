import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { expect, test, vi, describe, afterEach } from "vitest";
import Page from "./page";
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(),
}));
vi.mock("@/actions/register/action", () => ({
  register: vi.fn(),
}));
vi.mock("@/actions/resend/action", () => ({
  resend: vi.fn(),
}));

describe("Page", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("should render the page", () => {
    vi.mocked(useSearchParams).mockReturnValue({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      get: (key: string) => {
        return null;
      },
    } as unknown as ReadonlyURLSearchParams);
    render(<Page />);
    expect(
      screen.getByText(
        "Get WhatsApp message from Monika when your website is down."
      )
    ).toBeInTheDocument();
  });
});
