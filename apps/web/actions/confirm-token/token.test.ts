import { TestDatabase } from "@workspace/database/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isTokenValid } from "./token";
import { runWithContext } from "@/lib/context/db";

describe(`isTokenValid`, () => {
  let testDb: TestDatabase;

  beforeEach(async () => {
    testDb = new TestDatabase();
    await testDb.setup();
  });

  afterEach(async () => {
    await testDb.cleanup();
  });

  it(`TEST#1: should return null if there is no registration`, async () => {
    // act
    const result = await runWithContext(
      { prisma: testDb.getPrismaClient() },
      async () => {
        return isTokenValid("invalid");
      }
    );

    // assert
    expect(result).toBeNull();
  });

  it(`TEST#2: should return null if the registration is expired`, async () => {
    // setup

    await testDb.getPrismaClient().registrations.create({
      data: {
        phoneHash: "phoneHash",
        name: "name",
        token: "expired",
        expiredAt: new Date(Date.now() - 1000),
      },
    });

    // act
    const result = await runWithContext(
      { prisma: testDb.getPrismaClient() },
      async () => {
        return isTokenValid("expired");
      }
    );

    // assert
    expect(result).toBeNull();
  });

  it(`TEST#3: should return the registration if the token is valid`, async () => {
    // setup
    await testDb.getPrismaClient().registrations.create({
      data: {
        phoneHash: "phoneHash",
        name: "name",
        token: "valid",
        expiredAt: new Date(Date.now() + 1000),
      },
    });

    // act
    const result = await runWithContext(
      { prisma: testDb.getPrismaClient() },
      async () => {
        return isTokenValid("valid");
      }
    );

    // assert
    expect(result).toBeDefined();
    expect(result?.phoneHash).toBe("phoneHash");
    expect(result?.name).toBe("name");
    expect(result?.token).toBe("valid");
    expect(result?.expiredAt).toBeDefined();
  });
});
