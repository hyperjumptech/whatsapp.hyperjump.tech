import "@testing-library/jest-dom";
import { expect, test, describe } from "vitest";
import TestWebhookSuccess from "./page";
import { render, screen } from "@testing-library/react";

describe("TestWebhookSuccess", () => {
  test("TEST#1: should render the heading", () => {
    render(<TestWebhookSuccess />);

    // Check that the Privacy Policy heading exists in h1
    expect(
      screen.getByRole("heading", { level: 1, name: "Message sent!" })
    ).toBeInTheDocument();
  });

  test("TEST#2: should render the text", () => {
    render(<TestWebhookSuccess />);

    expect(
      screen.getByText("You should receive a message in your Whatsapp shortly.")
    ).toBeInTheDocument();
  });

  test("TEST#3: should render the link", () => {
    render(<TestWebhookSuccess />);

    expect(
      screen.getByRole("link", { name: "Test again" })
    ).toBeInTheDocument();
  });
});
