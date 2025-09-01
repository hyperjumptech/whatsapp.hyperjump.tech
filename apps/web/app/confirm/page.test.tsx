import "@testing-library/jest-dom";
import { expect, test, describe } from "vitest";
import ConfirmPage from "./page";
import { render, screen } from "@testing-library/react";

describe("ConfirmPage", () => {
  test("TEST#1: should render the page", () => {
    render(<ConfirmPage />);
    expect(screen.getByText("Confirm your phone number")).toBeInTheDocument();
  });
});
