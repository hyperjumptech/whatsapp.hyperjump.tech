// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestDatabase } from "@workspace/database/test-utils";
import { errorCodes, resendActionCreator } from "./index";
import { sendInstructionMessage } from "@workspace/whatsapp/send-message";
import { redirect } from "next/navigation";
import { updateWebhookResendAt } from "@/lib/repositories/webhook-token";

vi.mock("@workspace/whatsapp/send-message", () => {
  return {
    sendInstructionMessage: vi.fn(),
  };
});

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

describe(`actions/resend`, () => {
  let testDb: TestDatabase;

  beforeEach(async () => {
    testDb = new TestDatabase();
    await testDb.setup();
  });

  afterEach(async () => {
    await testDb.cleanup();
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  it(`TEST#1: should return error if the request is invalid`, async () => {
    // act
    const resend = resendActionCreator(testDb.getPrismaClient());
    const result = await resend({
      // @ts-expect-error - we want to test the invalid type
      phonee: "1234567890",
    });

    // assert
    expect(result).toBeDefined();
    expect(result?.error).toBe(errorCodes.INVALID_DATA);
  });

  it(`TEST#2: should return error if the webhook is not found`, async () => {
    // setup
    await testDb.getPrismaClient().users.create({
      data: {
        phoneHash: "1234567890",
        name: "John Doe",
      },
    });

    // act
    const resend = resendActionCreator(testDb.getPrismaClient());
    const result = await resend({
      phone: "1234567890",
    });

    // assert
    expect(result).toBeDefined();
    expect(result?.error).toBe(errorCodes.WEBHOOK_NOT_FOUND);
  });

  it(`TEST#3: should return error if the webhook has been attempted and too soon`, async () => {
    // setup
    await testDb.getPrismaClient().webhook_token.create({
      data: {
        token: "1234567890",
        resendAt: new Date(Date.now() + 10000),
        user: "+1234567890",
        name: "John Doe",
      },
    });

    // act
    const resend = resendActionCreator(testDb.getPrismaClient());
    const result = await resend({
      phone: "1234567890",
    });

    // assert
    expect(result).toBeDefined();
    expect(result?.error).toBe(errorCodes.WEBHOOK_RESEND_TOO_SOON);
  });

  it(`TEST#4: should call sendInstructionMessage with the correct arguments`, async () => {
    // setup
    vi.mocked(sendInstructionMessage).mockResolvedValue(undefined);
    await testDb.getPrismaClient().webhook_token.create({
      data: {
        token: "1234567890",
        resendAt: new Date(Date.now() - 10000),
        user: "+1234567890",
        name: "John Doe",
      },
    });

    // act
    const resend = resendActionCreator(testDb.getPrismaClient());
    const result = await resend({
      phone: "+1234567890",
    });

    // assert
    expect(sendInstructionMessage).toHaveBeenCalledWith({
      phone: "+1234567890",
      webhookToken: "1234567890",
    });
    expect(result).toBeUndefined();
  });

  it(`TEST#5: should call updateWebhookResendAt with the correct arguments`, async () => {
    // setup
    vi.mocked(sendInstructionMessage).mockResolvedValue(undefined);

    await testDb.getPrismaClient().webhook_token.create({
      data: {
        token: "1234567890",
        resendAt: new Date(Date.now() - 10000),
        user: "+1234567890",
        name: "John Doe",
      },
    });

    // act
    const resend = resendActionCreator(testDb.getPrismaClient());
    const result = await resend({
      phone: "1234567890",
    });

    // assert
    expect(updateWebhookResendAt).toHaveBeenCalledWith("1234567890");
    expect(result).toBeUndefined();
  });

  it(`TEST#6: should redirect to the confirm page`, async () => {
    // setup
    vi.mocked(sendInstructionMessage).mockResolvedValue(undefined);

    await testDb.getPrismaClient().webhook_token.create({
      data: {
        token: "1234567890",
        resendAt: new Date(Date.now() - 10000),
        user: "+1234567890",
        name: "John Doe",
      },
    });

    // act
    const resend = resendActionCreator(testDb.getPrismaClient());
    await resend({
      phone: "1234567890",
    });

    // assert
    expect(redirect).toHaveBeenCalledWith("/confirmed");
  });

  it("TEST#6: should successfully resend the instruction when received phone number is not prefixed with +", async () => {
    // setup
    vi.mocked(sendInstructionMessage).mockResolvedValue(undefined);

    await testDb.getPrismaClient().webhook_token.create({
      data: {
        token: "1234567890",
        resendAt: new Date(Date.now() - 10000),
        user: "+1234567890",
        name: "John Doe",
      },
    });

    // act
    const resend = resendActionCreator(testDb.getPrismaClient());
    await resend({
      phone: "1234567890",
    });

    // assert
    expect(redirect).toHaveBeenCalledWith("/confirmed");
  });
});
