// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestDatabase } from "@workspace/database/test-utils";
import { errorCodes, testWebhookActionCreator } from "./index";
import {
  sendIncidentRecoveryMessage,
  sendStartTerminateMessage,
  sendStatusUpdateMessage,
} from "@workspace/whatsapp/send-message";
import { redirect } from "next/navigation";

vi.mock("@workspace/whatsapp/send-message", () => {
  return {
    sendInstructionMessage: vi.fn(),
    sendStartTerminateMessage: vi.fn(),
    sendIncidentRecoveryMessage: vi.fn(),
    sendStatusUpdateMessage: vi.fn(),
  };
});

vi.mock("server-only", () => ({
  default: vi.fn(),
}));

vi.mock("@/lib/repositories/webhook-token", async (importOriginal) => {
  const original = await importOriginal();
  return {
    // @ts-expect-error - we want to mock the updateWebhookResendAt function
    ...original,
    updateWebhookResendAt: vi.fn(),
  };
});

vi.mock("next/navigation", () => {
  return {
    redirect: vi.fn(),
  };
});

describe(`actions/test-webhook`, () => {
  let testDb: TestDatabase;

  beforeEach(async () => {
    testDb = new TestDatabase();
    await testDb.setup();
  });

  afterEach(async () => {
    await testDb.cleanup();
    vi.clearAllMocks();
  });

  it(`TEST#1: should return error if the request is invalid`, async () => {
    // act
    const testWebhook = testWebhookActionCreator(testDb.getPrismaClient());
    const result = await testWebhook({
      // @ts-expect-error - we want to test the invalid type
      type: "invalidtype",
      token: "1234567890",
    });

    // assert
    expect(result).toBeDefined();
    expect(result?.error).toBe(errorCodes.INVALID_DATA);
  });

  it(`TEST#2: should return error if the webhook is not found`, async () => {
    // setup
    await testDb.getPrismaClient().webhook_token.create({
      data: {
        token: "1234567890",
        resendAt: new Date(Date.now() - 10000),
        user: "1234567890",
        name: "John Doe",
      },
    });

    // act
    const testWebhook = testWebhookActionCreator(testDb.getPrismaClient());
    const result = await testWebhook({
      type: "confirmation",
      token: "123456789000",
    });

    // assert
    expect(result).toBeDefined();
    expect(result?.error).toBe(errorCodes.WEBHOOK_NOT_FOUND);
  });

  it(`TEST#3: should return error if the user is not found`, async () => {
    // setup
    await testDb.getPrismaClient().webhook_token.create({
      data: {
        token: "1234567890",
        resendAt: new Date(Date.now() + 10000),
        user: "123456789000",
        name: "John Doe",
      },
    });

    // act
    const testWebhook = testWebhookActionCreator(testDb.getPrismaClient());
    const result = await testWebhook({
      type: "confirmation",
      token: "1234567890",
    });

    // assert
    expect(result).toBeDefined();
    expect(result?.error).toBe(errorCodes.USER_NOT_FOUND);
  });

  it(`TEST#4.1: should call sendStartTerminateMessage when the type is start`, async () => {
    // setup
    vi.mocked(sendStartTerminateMessage).mockResolvedValue(undefined);
    await testDb.getPrismaClient().webhook_token.create({
      data: {
        token: "1234567890",
        resendAt: new Date(Date.now() + 10000),
        user: "123456789000",
        name: "John Doe",
      },
    });
    await testDb.getPrismaClient().users.create({
      data: {
        phoneHash: "123456789000",
        name: "John Doe",
      },
    });

    // act
    const testWebhook = testWebhookActionCreator(testDb.getPrismaClient());
    const result = await testWebhook({
      type: "start",
      token: "1234567890",
    });

    // assert
    expect(sendStartTerminateMessage).toHaveBeenCalledWith({
      phone: "123456789000",
      type: "start",
      ipAddress: "127.0.0.1",
    });
    expect(result).toBeUndefined();
  });

  it(`TEST#4.2: should call sendStartTerminateMessage when the type is terminate`, async () => {
    // setup
    vi.mocked(sendStartTerminateMessage).mockResolvedValue(undefined);
    await testDb.getPrismaClient().webhook_token.create({
      data: {
        token: "1234567890",
        resendAt: new Date(Date.now() + 10000),
        user: "123456789000",
        name: "John Doe",
      },
    });
    await testDb.getPrismaClient().users.create({
      data: {
        phoneHash: "123456789000",
        name: "John Doe",
      },
    });

    // act
    const testWebhook = testWebhookActionCreator(testDb.getPrismaClient());
    const result = await testWebhook({
      type: "terminate",
      token: "1234567890",
    });

    // assert
    expect(sendStartTerminateMessage).toHaveBeenCalledWith({
      phone: "123456789000",
      type: "terminate",
      ipAddress: "127.0.0.1",
    });
    expect(result).toBeUndefined();
  });

  it(`TEST#5.1: should call sendIncidentRecoveryMessage when the type is incident`, async () => {
    // setup
    vi.mocked(sendIncidentRecoveryMessage).mockResolvedValue(undefined);
    await testDb.getPrismaClient().webhook_token.create({
      data: {
        token: "1234567890",
        resendAt: new Date(Date.now() + 10000),
        user: "123456789000",
        name: "John Doe",
      },
    });
    await testDb.getPrismaClient().users.create({
      data: {
        phoneHash: "123456789000",
        name: "John Doe",
      },
    });

    // act
    const testWebhook = testWebhookActionCreator(
      testDb.getPrismaClient(),
      undefined,
      undefined,
      {
        now: () => new Date("2025-08-27T09:52:06.000Z"),
      }
    );
    const result = await testWebhook({
      type: "incident",
      token: "1234567890",
    });

    // assert
    expect(sendIncidentRecoveryMessage).toHaveBeenCalledWith({
      phone: "123456789000",
      type: "incident",
      alert: "Status is 400, was expecting 200.",
      url: "http://www.example.com",
      time: "Wed, 27 Aug 2025 09:52:06 GMT",
      monika:
        "127.0.0.1 (local), 129.111.33.135 (public) My-Computer.local (hostname)",
    });
    expect(result).toBeUndefined();
  });

  it(`TEST#5.2: should call sendIncidentRecoveryMessage when the type is recovery`, async () => {
    // setup
    vi.mocked(sendIncidentRecoveryMessage).mockResolvedValue(undefined);
    await testDb.getPrismaClient().webhook_token.create({
      data: {
        token: "1234567890",
        resendAt: new Date(Date.now() + 10000),
        user: "123456789000",
        name: "John Doe",
      },
    });
    await testDb.getPrismaClient().users.create({
      data: {
        phoneHash: "123456789000",
        name: "John Doe",
      },
    });

    // act
    const testWebhook = testWebhookActionCreator(
      testDb.getPrismaClient(),
      undefined,
      undefined,
      {
        now: () => new Date("2025-08-27T09:52:06.000Z"),
      }
    );
    const result = await testWebhook({
      type: "recovery",
      token: "1234567890",
    });

    // assert
    expect(sendIncidentRecoveryMessage).toHaveBeenCalledWith({
      phone: "123456789000",
      type: "recovery",
      alert: "Service is ok. Status now 200",
      url: "http://www.example.com",
      time: "Wed, 27 Aug 2025 09:52:06 GMT",
      monika:
        "127.0.0.1 (local), 129.111.33.135 (public) My-Computer.local (hostname)",
    });
    expect(result).toBeUndefined();
  });

  it(`TEST#6: should call sendStatusUpdateMessage when the type is status-update`, async () => {
    // setup
    vi.mocked(sendStatusUpdateMessage).mockResolvedValue(undefined);
    await testDb.getPrismaClient().webhook_token.create({
      data: {
        token: "1234567890",
        resendAt: new Date(Date.now() + 10000),
        user: "123456789000",
        name: "John Doe",
      },
    });
    await testDb.getPrismaClient().users.create({
      data: {
        phoneHash: "123456789000",
        name: "John Doe",
      },
    });

    // act
    const testWebhook = testWebhookActionCreator(
      testDb.getPrismaClient(),
      undefined,
      undefined,
      {
        now: () => new Date("2025-08-27T09:52:06.000Z"),
      }
    );
    const result = await testWebhook({
      type: "status-update",
      token: "1234567890",
    });

    // assert
    expect(sendStatusUpdateMessage).toHaveBeenCalledWith({
      phone: "123456789000",
      type: "status-update",
      numberOfProbes: "10",
      averageResponseTime: "100ms",
      numberOfIncidents: "1",
      numberOfRecoveries: "1",
      numberOfSentNotifications: "1",
      time: "Wed, 27 Aug 2025 09:52:06 GMT",
      monika:
        "127.0.0.1 (local), 129.111.33.135 (public) My-Computer.local (hostname)",
    });
    expect(result).toBeUndefined();
  });

  it(`TEST#7: should redirect to the confirm page`, async () => {
    // setup
    vi.mocked(sendStatusUpdateMessage).mockResolvedValue(undefined);
    await testDb.getPrismaClient().webhook_token.create({
      data: {
        token: "1234567890",
        resendAt: new Date(Date.now() + 10000),
        user: "123456789000",
        name: "John Doe",
      },
    });
    await testDb.getPrismaClient().users.create({
      data: {
        phoneHash: "123456789000",
        name: "John Doe",
      },
    });

    // act
    const testWebhook = testWebhookActionCreator(
      testDb.getPrismaClient(),
      undefined,
      undefined,
      {
        now: () => new Date("2025-08-27T09:52:06.000Z"),
      }
    );
    const result = await testWebhook({
      type: "status-update",
      token: "1234567890",
    });

    // assert
    expect(redirect).toHaveBeenCalledWith("/test-webhook/success");
  });
});
