// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TestDatabase } from "@workspace/database/test-utils";
import { runWithContext } from "@/lib/context/db";
import { deleteUserByPhoneHash, getUserByPhoneHash, saveUser } from "./user";
import { PrismaClient } from "@workspace/database";

describe(`repositories/user`, () => {
  let testDb: TestDatabase;

  beforeEach(async () => {
    testDb = new TestDatabase();
    await testDb.setup();
  });

  afterEach(async () => {
    await testDb.cleanup();
  });

  it(`TEST#1: should get a user by phone hash`, async () => {
    const prisma = testDb.getPrismaClient();

    // setup
    await prisma.users.create({
      data: {
        phoneHash: "1234567890",
        name: "John Doe",
      },
    });

    // act
    const user = await runWithContext({ prisma }, async () => {
      return getUserByPhoneHash("1234567890");
    });

    // assert
    expect(user).toBeDefined();
    expect(user?.name).toBe("John Doe");
  });

  it(`TEST#2: should save a user`, async () => {
    const prisma = testDb.getPrismaClient();
    const user = await runWithContext({ prisma }, async () => {
      return saveUser({
        phoneHash: "1234567890",
        name: "John Doe",
      });
    });
    expect(user).toBeDefined();
    const userFromDb = await prisma.users.findUnique({
      where: {
        phoneHash: "1234567890",
      },
    });
    expect(userFromDb).toBeDefined();
    expect(userFromDb?.name).toBe("John Doe");
  });

  it(`TEST#2: should save a user with transaction`, async () => {
    const prisma = testDb.getPrismaClient();

    const user = await prisma.$transaction(async (tx) => {
      return runWithContext({ prisma: tx as PrismaClient }, async () => {
        return saveUser({
          phoneHash: "1234567890",
          name: "John Doe",
        });
      });
    });
    expect(user).toBeDefined();
    const userFromDb = await prisma.users.findUnique({
      where: {
        phoneHash: "1234567890",
      },
    });
    expect(userFromDb).toBeDefined();
    expect(userFromDb?.name).toBe("John Doe");
  });

  it(`TEST#3: should delete a user`, async () => {
    const prisma = testDb.getPrismaClient();

    // setup
    await prisma.users.create({
      data: {
        phoneHash: "1234567890",
        name: "John Doe",
      },
    });

    // act
    const user = await runWithContext({ prisma }, async () => {
      return deleteUserByPhoneHash("1234567890");
    });

    // assert
    expect(user).toBeDefined();
    const userFromDb = await prisma.users.findUnique({
      where: {
        phoneHash: "1234567890",
      },
    });
    expect(userFromDb).toBeNull();
  });
});
