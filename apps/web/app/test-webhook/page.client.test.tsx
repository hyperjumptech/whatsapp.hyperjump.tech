import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { expect, test, vi, describe, afterEach, beforeEach } from "vitest";
import TestWebhookPage from "./page.client";
import { useTestWebhook } from "@/hooks/use-test-webhook";
import {
  actionTemplate,
  explanation,
} from "@workspace/whatsapp/action-template";

vi.mock("@workspace/env", () => ({
  env: {
    NEXT_PUBLIC_BASE_URL: "https://webhook.site",
  },
}));

vi.mock("@/hooks/use-test-webhook", () => ({
  useTestWebhook: vi.fn(() => ({
    url: "https://webhook.site/",
    setUrl: vi.fn(),
    type: actionTemplate.incident,
    setType: vi.fn(),
    errorMessage: null,
  })),
}));

describe("TestWebhookPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useTestWebhook).mockReturnValue({
      url: "",
      setUrl: vi.fn(),
      type: actionTemplate.incident,
      setType: vi.fn(),
      errorMessage: "",
      submitTestWebhook: vi.fn(),
      pending: false,
    });
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("TEST#1: should render the webhook url input", () => {
    render(<TestWebhookPage />);
    expect(screen.getByTestId("webhook-input")).toBeInTheDocument();
  });

  test("TEST#1.1: should set the url on input", () => {
    vi.mocked(useTestWebhook).mockRestore();
    render(<TestWebhookPage />);
    act(() => {
      fireEvent.change(screen.getByTestId("webhook-input"), {
        target: { value: "https://webhook.site/" },
      });
    });
    expect(screen.getByTestId("webhook-input")).toHaveValue(
      "https://webhook.site/"
    );
  });

  test("TEST#2: should render the select input for notification type", () => {
    render(<TestWebhookPage />);
    expect(screen.getByTestId("type-select")).toBeInTheDocument();
  });

  test("TEST#2.1: should set the type on select input", () => {
    render(<TestWebhookPage />);
    act(() => {
      fireEvent.change(screen.getByTestId("type-select"), {
        target: { value: actionTemplate.incident },
      });
    });
    expect(screen.getByTestId("type-select")).toHaveValue(
      actionTemplate.incident
    );
  });

  test("TEST#3: should render the alert for notification type", () => {
    render(<TestWebhookPage />);
    act(() => {
      fireEvent.change(screen.getByTestId("type-select"), {
        target: { value: actionTemplate.incident },
      });
    });
    expect(screen.getByTestId("explanation")).toBeInTheDocument();
    expect(screen.getByTestId("explanation")).toHaveTextContent(
      explanation[actionTemplate.incident]
    );
  });

  test("TEST#4: should render the error message for invalid webhook url", () => {
    vi.mocked(useTestWebhook).mockReturnValue({
      url: "https://webhook.site/",
      setUrl: vi.fn(),
      type: actionTemplate.incident,
      setType: vi.fn(),
      errorMessage: "Invalid webhook url",
      submitTestWebhook: vi.fn(),
      pending: false,
    });
    render(<TestWebhookPage />);

    expect(screen.getByText("Invalid webhook url")).toBeInTheDocument();
  });

  test("TEST#5: should render the submit button", () => {
    render(<TestWebhookPage />);
    expect(screen.getByTestId("submit-button")).toBeInTheDocument();
  });

  test("TEST#5.1: should call the submitTestWebhook function when the submit button is clicked", () => {
    const submitTestWebhook = vi.fn();
    vi.mocked(useTestWebhook).mockReturnValue({
      url: "https://webhook.site/",
      setUrl: vi.fn(),
      type: actionTemplate.incident,
      setType: vi.fn(),
      errorMessage: "",
      submitTestWebhook,
      pending: false,
    });
    render(<TestWebhookPage />);
    act(() => {
      fireEvent.click(screen.getByTestId("submit-button"));
    });
    expect(submitTestWebhook).toHaveBeenCalled();
  });

  test("TEST#6: should disable the elements when the pending state is true", () => {
    vi.mocked(useTestWebhook).mockReturnValue({
      url: "https://webhook.site/",
      setUrl: vi.fn(),
      type: actionTemplate.incident,
      setType: vi.fn(),
      errorMessage: "",
      submitTestWebhook: vi.fn(),
      pending: true,
    });
    render(<TestWebhookPage />);
    expect(screen.getByTestId("webhook-input")).toBeDisabled();
    expect(screen.getByTestId("type-select")).toBeDisabled();
    expect(screen.getByTestId("submit-button")).toBeDisabled();
    expect(screen.getByTestId("submit-button")).toHaveTextContent(
      "Submitting..."
    );
  });
});
