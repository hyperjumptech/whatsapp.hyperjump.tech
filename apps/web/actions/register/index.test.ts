// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestDatabase } from "@workspace/database/test-utils";
import { errorCodes, registerActionCreator } from ".";
import { v4 as uuidv4 } from "uuid";
import { WhatsappClient } from "@workspace/whatsapp/client";
import { sendConfirmPhoneMessage } from "@workspace/whatsapp/send-message";
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

vi.mock("server-only", () => ({
  default: vi.fn(),
}));

describe(`actions/register`, () => {
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
    const register = registerActionCreator(
      testDb.getPrismaClient(),
      uuidv4,
      new WhatsappClient()
    );
    const result = await register({
      name: "Jo",
      phone: "+1234567890",
    });

    // assert
    expect(result).toBeDefined();
    expect(result?.error).toBe(errorCodes.INVALID_DATA);
  });

  it(`TEST#2: should return error if the phone number is already registered`, async () => {
    // setup
    await testDb.getPrismaClient().users.create({
      data: {
        phoneHash: "+1234567890",
        name: "John Doe",
      },
    });

    // act
    const register = registerActionCreator(
      testDb.getPrismaClient(),
      uuidv4,
      new WhatsappClient()
    );
    const result = await register({
      name: "John Doe",
      phone: "+1234567890",
    });

    // assert
    expect(result).toBeDefined();
    expect(result?.error).toBe(errorCodes.PHONE_NUMBER_ALREADY_REGISTERED);
  });

  it(`TEST#3: should return error if the registration has been attempted and is not expired`, async () => {
    // setup
    await testDb.getPrismaClient().registrations.create({
      data: {
        phoneHash: "+1234567890",
        token: "1234567890",
        expiredAt: new Date(Date.now() + 1000),
        name: "John Doe",
      },
    });

    // act
    const register = registerActionCreator(
      testDb.getPrismaClient(),
      uuidv4,
      new WhatsappClient()
    );
    const result = await register({
      name: "John Doe",
      phone: "+1234567890",
    });

    // assert
    expect(result).toBeDefined();
    expect(result?.error).toBe(errorCodes.REGISTRATION_ALREADY_ATTEMPTED);
  });

  it(`TEST#4: should call sendConfirmPhoneMessage with the correct arguments`, async () => {
    // setup
    vi.mocked(sendConfirmPhoneMessage).mockResolvedValue(undefined);

    // act
    const register = registerActionCreator(
      testDb.getPrismaClient(),
      uuidv4,
      new WhatsappClient()
    );
    const result = await register({
      name: "John Doe",
      phone: "+1234567890",
    });

    // assert
    const newRegistration = await testDb
      .getPrismaClient()
      .registrations.findUnique({
        where: {
          phoneHash: "+1234567890",
        },
      });
    expect(newRegistration).toBeDefined();
    const activationToken = newRegistration?.token;
    expect(sendConfirmPhoneMessage).toHaveBeenCalledWith({
      name: "John Doe",
      activationToken,
      phone: "+1234567890",
      expiredAt: newRegistration?.expiredAt.toISOString(),
    });
    expect(result).toBeUndefined();
  });

  it(`TEST#5: should redirect to the confirm page`, async () => {
    // setup
    vi.mocked(sendConfirmPhoneMessage).mockResolvedValue(undefined);

    // act
    const register = registerActionCreator(
      testDb.getPrismaClient(),
      uuidv4,
      new WhatsappClient()
    );
    await register({
      name: "John Doe",
      phone: "+1234567890",
    });

    // assert
    const newRegistration = await testDb
      .getPrismaClient()
      .registrations.findUnique({
        where: {
          phoneHash: "+1234567890",
        },
      });
    expect(newRegistration).toBeDefined();
    const activationToken = newRegistration?.token;
    expect(sendConfirmPhoneMessage).toHaveBeenCalledWith({
      name: "John Doe",
      activationToken,
      phone: "+1234567890",
      expiredAt: newRegistration?.expiredAt.toISOString(),
    });
    expect(redirect).toHaveBeenCalledWith("/confirm");
  });
});
