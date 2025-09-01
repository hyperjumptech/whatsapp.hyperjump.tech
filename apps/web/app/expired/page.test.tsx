import "@testing-library/jest-dom";
import { expect, test, describe } from "vitest";
import ExpiredPage from "./page";
import { render, screen } from "@testing-library/react";

describe("ExpiredPage", () => {
  test("TEST#1: should render the page", () => {
    render(<ExpiredPage />);
    expect(screen.getByText("Link has expired")).toBeInTheDocument();
  });
});
