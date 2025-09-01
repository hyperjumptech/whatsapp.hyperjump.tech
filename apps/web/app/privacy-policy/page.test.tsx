import "@testing-library/jest-dom";
import { expect, test, describe } from "vitest";
import PrivacyPolicy from "./page";
import { render, screen } from "@testing-library/react";

describe("PrivacyPolicy", () => {
  test("TEST#1: should render the page", () => {
    render(<PrivacyPolicy />);

    // Check that the Privacy Policy heading exists in h1
    expect(
      screen.getByRole("heading", { level: 1, name: "Privacy Policy" })
    ).toBeInTheDocument();
  });
});
