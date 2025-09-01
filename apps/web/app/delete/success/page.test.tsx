import "@testing-library/jest-dom";
import { expect, test, describe } from "vitest";
import DeletedPage from "./page";
import { render, screen } from "@testing-library/react";

describe("DeletedPage", () => {
  test("TEST#1: should render the page", () => {
    render(<DeletedPage />);
    expect(screen.getByText("Account Deleted")).toBeInTheDocument();
  });
});
