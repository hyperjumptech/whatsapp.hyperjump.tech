// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestDatabase } from "@workspace/database/test-utils";
import { errorCodes, deleteTokenActionCreator } from "./index";
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

describe(`actions/delete-token`, () => {
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
    const deleteToken = deleteTokenActionCreator(testDb.getPrismaClient());
    const result = await deleteToken({
      // @ts-expect-error - test, this should be a string
      token: 1,
    });

    // assert
    expect(result).toBeDefined();
    expect(result?.error).toBe(errorCodes.INVALID_DATA);
  });

  it(`TEST#2: should return error if the webhook token is not found`, async () => {
    // act
    const deleteToken = deleteTokenActionCreator(testDb.getPrismaClient());
    const result = await deleteToken({
      token: "1234567890",
    });

    // assert
    expect(result).toBeDefined();
    expect(result?.error).toBe(errorCodes.WEBHOOK_TOKEN_NOT_FOUND);
  });

  it(`TEST#3: should return error if the user is not found`, async () => {
    // setup
    await testDb.getPrismaClient().users.create({
      data: {
        phoneHash: "1234567890-",
        name: "John Doe",
      },
    });
    await testDb.getPrismaClient().webhook_token.create({
      data: {
        token: "1234567890",
        name: "John Doe",
        user: "1234567890",
      },
    });

    const deleteToken = deleteTokenActionCreator(testDb.getPrismaClient());
    const result = await deleteToken({
      token: "1234567890",
    });

    // assert
    expect(result).toBeDefined();
    expect(result?.error).toBe(errorCodes.USER_NOT_FOUND);
  });

  it(`TEST#4: should delete the user, webhook token and registration`, async () => {
    // setup
    await testDb.getPrismaClient().users.create({
      data: {
        phoneHash: "1234567890",
        name: "John Doe",
      },
    });
    await testDb.getPrismaClient().webhook_token.create({
      data: {
        token: "1234567890",
        name: "John Doe",
        user: "1234567890",
      },
    });

    // act
    const deleteToken = deleteTokenActionCreator(testDb.getPrismaClient());
    await deleteToken({
      token: "1234567890",
    });

    // assert
    const user = await testDb.getPrismaClient().users.findUnique({
      where: {
        phoneHash: "1234567890",
      },
    });
    expect(user).toBeNull();

    const webhookToken = await testDb
      .getPrismaClient()
      .webhook_token.findUnique({
        where: {
          token: "1234567890",
        },
      });
    expect(webhookToken).toBeNull();
  });

  it(`TEST#7: should redirect to the delete success page`, async () => {
    // setup
    await testDb.getPrismaClient().users.create({
      data: {
        phoneHash: "1234567890",
        name: "John Doe",
      },
    });
    await testDb.getPrismaClient().webhook_token.create({
      data: {
        token: "1234567890",
        name: "John Doe",
        user: "1234567890",
      },
    });
    await testDb.getPrismaClient().registrations.create({
      data: {
        phoneHash: "1234567890",
        token: "1234567890",
        expiredAt: new Date(Date.now() + 1000),
        name: "John Doe",
      },
    });

    // act
    const deleteToken = deleteTokenActionCreator(testDb.getPrismaClient());
    await deleteToken({
      token: "1234567890",
    });

    expect(redirect).toHaveBeenCalledWith("/delete/success");
  });
});
