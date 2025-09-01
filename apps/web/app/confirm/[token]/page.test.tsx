import "@testing-library/jest-dom";
import { expect, test, describe, vi, beforeEach } from "vitest";
import ConfirmPage from "./page";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useConfirmToken } from "@/hooks/use-confirm-token";

vi.mock("../../../hooks/use-confirm-token", () => ({
  useConfirmToken: vi.fn(),
}));

describe("ConfirmPage", () => {
  beforeEach(() => {
    vi.mocked(useConfirmToken).mockReturnValue({
      token: "123",
      confirmToken: vi.fn().mockResolvedValue({ error: null }),
      pending: false,
      error: null,
    });
  });
  test("TEST#1: should render the page", () => {
    render(<ConfirmPage />);
    expect(
      screen.getByRole("heading", { name: "Confirm registration" })
    ).toBeInTheDocument();
  });

  test("TEST#2: should show the error if the confirmToken action fails", () => {
    vi.mocked(useConfirmToken).mockReturnValue({
      token: "123",
      confirmToken: vi.fn().mockResolvedValue({ error: "Error" }),
      pending: false,
      error: "Error message",
    });
    render(<ConfirmPage />);
    expect(screen.getByText("Error message")).toBeInTheDocument();
  });

  test("TEST#3: should show button", () => {
    vi.mocked(useConfirmToken).mockReturnValue({
      token: "123",
      confirmToken: vi.fn().mockResolvedValue({ error: null }),
      pending: true,
      error: null,
    });

    render(<ConfirmPage />);
    expect(
      screen.getByRole("button", { name: "Confirm registration" })
    ).toBeInTheDocument();
  });

  test("TEST#4: should call the confirmToken action on button click", () => {
    const confirmToken = vi.fn();
    vi.mocked(useConfirmToken).mockReturnValue({
      token: "123",
      confirmToken,
      pending: false,
      error: "Error",
    });

    render(<ConfirmPage />);
    act(() => {
      fireEvent.click(
        screen.getByRole("button", { name: "Confirm registration" })
      );
    });
    expect(confirmToken).toHaveBeenCalled();
  });

  test("TEST#5: should disable button when pending", () => {
    vi.mocked(useConfirmToken).mockReturnValue({
      token: "123",
      confirmToken: vi.fn().mockResolvedValue({ error: null }),
      pending: true,
      error: null,
    });
    render(<ConfirmPage />);
    expect(
      screen.getByRole("button", { name: "Confirm registration" })
    ).toBeDisabled();
  });
});
