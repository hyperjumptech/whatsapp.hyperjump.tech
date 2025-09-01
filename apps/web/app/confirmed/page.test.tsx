import "@testing-library/jest-dom";
import { expect, test, describe } from "vitest";
import ConfirmedPage from "./page";
import { render, screen } from "@testing-library/react";

describe("ConfirmedPage", () => {
  test("TEST#1: should render the page", () => {
    render(<ConfirmedPage />);
    expect(screen.getByText("Phone number confirmed!")).toBeInTheDocument();
  });
});
