import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getUserByPhoneHash } from "./user.js";
import { TestDatabase } from "@workspace/database/test-utils";
import { runWithContext } from "@workspace/database/context";

describe("user", () => {
  let testDb: TestDatabase;
  beforeEach(async () => {
    testDb = new TestDatabase();
    await testDb.setup();
  });

  afterEach(async () => {
    await testDb.cleanup();
  });
  it("should get the user by the phone hash if any", async () => {
    // setup
    const prisma = testDb.getPrismaClient();
    await prisma.users.create({
      data: {
        phoneHash: "test",
        name: "test",
      },
    });
    // act
    const user = await runWithContext({ prisma }, async () => {
      return await getUserByPhoneHash("test");
    });
    // assert
    expect(user).toBeDefined();
    expect(user?.phoneHash).toBe("test");
    expect(user?.name).toBe("test");
  });

  it("should return null if the user is not found", async () => {
    // setup
    const prisma = testDb.getPrismaClient();
    // act
    const user = await runWithContext({ prisma }, async () => {
      return await getUserByPhoneHash("test");
    });
    // assert
    expect(user).toBeNull();
  });
});
