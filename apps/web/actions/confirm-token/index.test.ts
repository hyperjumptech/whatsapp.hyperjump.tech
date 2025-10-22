// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestDatabase } from "@workspace/database/test-utils";
import { confirmTokenActionCreator, errorCodes } from "./index";
import { sendInstructionMessage } from "@workspace/whatsapp/send-message";
import { redirect } from "next/navigation";

vi.mock("@workspace/whatsapp/send-message", () => {
  return {
    sendConfirmPhoneMessage: vi.fn(),
  };
});

vi.mock("next/navigation", () => {
  return {
    redirect: vi.fn(),
  };
});

vi.mock("@workspace/whatsapp/send-message", () => {
  return {
    sendInstructionMessage: vi.fn(),
  };
});

describe(`actions/confirm-token`, () => {
  let testDb: TestDatabase;

  beforeEach(async () => {
    testDb = new TestDatabase();
    await testDb.setup();
  });

  afterEach(async () => {
    await testDb.cleanup();
  });

  it(`TEST#1: should return error if the request is invalid`, async () => {
    // act
    const confirmToken = confirmTokenActionCreator(testDb.getPrismaClient());
    const result = await confirmToken({
      // @ts-expect-error - test
      token: 1,
    });

    // assert
    expect(result).toBeDefined();
    expect(result?.error).toBe(errorCodes.INVALID_DATA);
  });

  it(`TEST#2: should return error if the token is invalid`, async () => {
    // act
    const confirmToken = confirmTokenActionCreator(testDb.getPrismaClient());
    const result = await confirmToken({
      token: "1234567890",
    });

    // assert
    expect(result).toBeDefined();
    expect(result?.error).toBe(errorCodes.INVALID_TOKEN);
  });

  it(`TEST#3: should call sendInstructionMessage with the correct arguments`, async () => {
    // setup
    await testDb.getPrismaClient().registrations.create({
      data: {
        phoneHash: "1234567890",
        token: "1234567890",
        expiredAt: new Date(Date.now() + 1000),
        name: "John Doe",
      },
    });

    // act
    const confirmToken = confirmTokenActionCreator(testDb.getPrismaClient());
    await confirmToken({
      token: "1234567890",
    });

    const user = await testDb.getPrismaClient().users.findUnique({
      where: {
        phoneHash: "1234567890",
      },
    });
    expect(user).toBeDefined();

    const webhook = await testDb.getPrismaClient().webhook_token.findFirst({
      where: {
        user: user!.phoneHash,
      },
    });
    expect(webhook).toBeDefined();

    expect(sendInstructionMessage).toHaveBeenCalledWith({
      phone: user!.phoneHash,
      webhookToken: webhook!.token,
    });

    const registration = await testDb
      .getPrismaClient()
      .registrations.findUnique({
        where: {
          phoneHash: user!.phoneHash,
        },
      });
    expect(registration).toBeNull();
  });

  it(`TEST#4: should redirect to the confirmed page`, async () => {
    // setup
    await testDb.getPrismaClient().registrations.create({
      data: {
        phoneHash: "1234567890",
        token: "1234567890",
        expiredAt: new Date(Date.now() + 1000),
        name: "John Doe",
      },
    });

    // act
    const confirmToken = confirmTokenActionCreator(testDb.getPrismaClient());
    await confirmToken({
      token: "1234567890",
    });

    expect(redirect).toHaveBeenCalledWith("/confirmed");
  });
});
