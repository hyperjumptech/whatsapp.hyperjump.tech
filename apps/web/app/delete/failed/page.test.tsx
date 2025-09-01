import "@testing-library/jest-dom";
import { expect, test, describe } from "vitest";
import DeleteFailedPage from "./page";
import { render, screen } from "@testing-library/react";

describe("DeleteFailedPage", () => {
  test("TEST#1: should render the page", () => {
    render(<DeleteFailedPage />);
    expect(
      screen.getByText("Account could not be deleted!")
    ).toBeInTheDocument();
  });
});
