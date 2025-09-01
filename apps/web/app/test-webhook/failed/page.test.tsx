import "@testing-library/jest-dom";
import { expect, test, describe } from "vitest";
import TestWebhookFailed from "./page";
import { render, screen } from "@testing-library/react";

describe("TestWebhookFailed", () => {
  test("TEST#1: should render the heading", () => {
    render(<TestWebhookFailed />);

    // Check that the Privacy Policy heading exists in h1
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Message cannot be sent!",
      })
    ).toBeInTheDocument();
  });

  test("TEST#2: should render the text", () => {
    render(<TestWebhookFailed />);

    expect(
      screen.getByText("The webhook you provided was invalid.")
    ).toBeInTheDocument();
  });

  test("TEST#3: should render the link", () => {
    render(<TestWebhookFailed />);

    expect(
      screen.getByRole("link", { name: "Test again" })
    ).toBeInTheDocument();
  });
});
