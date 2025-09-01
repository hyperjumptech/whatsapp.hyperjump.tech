import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { expect, test, vi, describe } from "vitest";
import TestWebhookPage from "./page";

vi.mock("./page.client", () => ({
  default: vi.fn().mockReturnValue(<div>Test Webhook Page Client</div>),
}));

describe("TestWebhookPage", () => {
  test("TEST#1: should render the page and the client component", () => {
    render(<TestWebhookPage />);
    expect(screen.getByText("Test your Webhook")).toBeInTheDocument();
    expect(screen.getByText("Test Webhook Page Client")).toBeInTheDocument();
  });
});
