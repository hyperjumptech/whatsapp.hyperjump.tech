import "@testing-library/jest-dom";
import { expect, test, describe } from "vitest";
import InvalidPage from "./page";
import { render, screen } from "@testing-library/react";

describe("InvalidPage", () => {
  test("TEST#1: should render the page", () => {
    render(<InvalidPage />);
    expect(screen.getByText("Invalid Deletion Link")).toBeInTheDocument();
  });
});
