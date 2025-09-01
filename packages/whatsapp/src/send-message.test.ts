// @vitest-environment node

import { describe, it, expect, vi } from "vitest";
import {
  sendConfirmPhoneMessage,
  sendIncidentRecoveryMessage,
  sendStartTerminateMessage,
  sendStatusUpdateMessage,
} from "./send-message.js";
import { sendMessageTemplate } from "./templates.js";
import { sendInstructionMessage } from "./send-message.js";

vi.mock("./templates.js", () => {
  return {
    sendMessageTemplate: vi.fn(),
  };
});

vi.mock("@workspace/env", () => {
  return {
    env: {
      NEXT_PUBLIC_BASE_URL: "https://test.com",
      NEXT_PUBLIC_MONIKA_NOTIFY_API_URL: "https://test.com",
      NEXT_PUBLIC_MONIKA_NOTIF_DOC: "https://test.com/docs",
    },
  };
});

describe("send-message", () => {
  it("TEST#1: sendConfirmPhoneMessage > should call sendMessageTemplate with the correct arguments", async () => {
    vi.mocked(sendMessageTemplate).mockResolvedValue({
      error: null,
      data: { messages: [{ id: "test-id" }] },
    });
    await sendConfirmPhoneMessage({
      name: "test",
      activationToken: "test",
      phone: "test",
      expiredAt: "test",
    });
    expect(sendMessageTemplate).toHaveBeenCalledWith({
      phone: "test",
      type: "confirmation",
      input: {
        name: "test",
        activationLink: "https://test.com/confirm/test",
        expiredAt: "test",
      },
    });
  });

  it("TEST#2: sendInstructionMessage > should call sendMessageTemplate with the correct arguments", async () => {
    vi.mocked(sendMessageTemplate).mockResolvedValue({
      error: null,
      data: { messages: [{ id: "test-id" }] },
    });
    await sendInstructionMessage({
      phone: "test",
      webhookToken: "test",
    });
    expect(sendMessageTemplate).toHaveBeenCalledWith({
      phone: "test",
      type: "instruction",
      input: {
        notifyWebhookUrl: "https://test.com/api/notify?token=test",
        deleteWebhookUrl: "https://test.com/delete/test",
        docsUrl: "https://test.com/docs",
      },
    });
  });

  it("TEST#3: sendStartTerminateMessage > should call sendMessageTemplate with the correct arguments", async () => {
    vi.mocked(sendMessageTemplate).mockResolvedValue({
      error: null,
      data: { messages: [{ id: "test-id" }] },
    });
    await sendStartTerminateMessage({
      phone: "test",
      type: "start",
      ipAddress: "127.0.0.1",
    });
    expect(sendMessageTemplate).toHaveBeenCalledWith({
      phone: "test",
      type: "start",
      input: {
        ipAddress: "127.0.0.1",
      },
    });
  });

  it("TEST#4: sendIncidentRecoveryMessage > should call sendMessageTemplate with the correct arguments", async () => {
    vi.mocked(sendMessageTemplate).mockResolvedValue({
      error: null,
      data: { messages: [{ id: "test-id" }] },
    });
    await sendIncidentRecoveryMessage({
      phone: "test",
      type: "incident",
      alert: "Incident",
      url: "https://test.com",
      time: "2021-01-01",
      monika: "test",
    });
    expect(sendMessageTemplate).toHaveBeenCalledWith({
      phone: "test",
      type: "incident",
      input: {
        alert: "Incident",
        url: "https://test.com",
        time: "2021-01-01",
        monika: "test",
      },
    });
  });

  it("TEST#5: sendStatusUpdateMessage > should call sendMessageTemplate with the correct arguments", async () => {
    vi.mocked(sendMessageTemplate).mockResolvedValue({
      error: null,
      data: { messages: [{ id: "test-id" }] },
    });
    await sendStatusUpdateMessage({
      phone: "test",
      type: "status-update",
      time: "2021-01-01",
      monika: "test",
      numberOfProbes: "10",
      averageResponseTime: "100ms",
      numberOfIncidents: "1",
      numberOfRecoveries: "1",
      numberOfSentNotifications: "1",
    });
    expect(sendMessageTemplate).toHaveBeenCalledWith({
      phone: "test",
      type: "status-update",
      input: {
        time: "2021-01-01",
        monika: "test",
        numberOfProbes: "10",
        averageResponseTime: "100ms",
        numberOfIncidents: "1",
        numberOfRecoveries: "1",
        numberOfSentNotifications: "1",
      },
    });
  });
});
