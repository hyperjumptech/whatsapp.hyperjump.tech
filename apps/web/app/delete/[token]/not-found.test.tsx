import "@testing-library/jest-dom";
import { expect, test, describe } from "vitest";
import NotFound from "./not-found";
import { render, screen } from "@testing-library/react";

describe("NotFound", () => {
  test("TEST#1: should render the page", () => {
    render(<NotFound />);
    expect(screen.getByText("Account not found")).toBeInTheDocument();
  });
});
