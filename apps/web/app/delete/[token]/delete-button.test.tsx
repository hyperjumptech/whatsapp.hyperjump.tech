import "@testing-library/jest-dom";
import { expect, test, describe, vi } from "vitest";
import DeleteButton from "./delete-button";
import { act, render, screen, waitFor } from "@testing-library/react";
import { deleteToken } from "@/actions/delete-token/action";

vi.mock("@/actions/delete-token/action", () => ({
  deleteToken: vi.fn(),
}));

describe("DeleteButton", () => {
  test("TEST#1: should render the page", () => {
    render(<DeleteButton token="123" />);
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  test("TEST#2: should disable the button when deleting", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let deferredResolve: (value: any) => void = () => {};
    vi.mocked(deleteToken).mockImplementation(() => {
      return new Promise((resolve) => {
        deferredResolve = resolve;
      });
    });
    const { getByText } = render(<DeleteButton token="123" />);
    const button = getByText("Delete");

    act(() => {
      button.click();
    });
    expect(button).toBeDisabled();
    deferredResolve({ success: true });
    await waitFor(() => {
      expect(button).toBeEnabled();
    });
  });

  test("TEST#3: should show correct button text", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let deferredResolve: (value: any) => void = () => {};
    vi.mocked(deleteToken).mockImplementation(() => {
      return new Promise((resolve) => {
        deferredResolve = resolve;
      });
    });
    const { getByText } = render(<DeleteButton token="123" />);
    const button = getByText("Delete");

    act(() => {
      button.click();
    });
    expect(button).toHaveTextContent("Deleting...");
    deferredResolve({ success: true });
    await waitFor(() => {
      expect(button).toHaveTextContent("Delete");
    });
  });
});
