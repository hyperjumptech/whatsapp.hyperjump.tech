import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getWebhookByToken } from "./webhook-token.js";
import { TestDatabase } from "@workspace/database/test-utils";
import { runWithContext } from "@workspace/database/context";

describe("webhook-token", () => {
  let testDb: TestDatabase;
  beforeEach(async () => {
    testDb = new TestDatabase();
    await testDb.setup();
  });

  afterEach(async () => {
    await testDb.cleanup();
  });
  it("should get the webhook token by the token if any", async () => {
    // setup
    const prisma = testDb.getPrismaClient();
    await prisma.webhook_token.create({
      data: {
        token: "test",
        user: "test",
        name: "test",
      },
    });
    // act
    const webhookToken = await runWithContext({ prisma }, async () => {
      return await getWebhookByToken("test");
    });
    // assert
    expect(webhookToken).toBeDefined();
    expect(webhookToken?.token).toBe("test");
    expect(webhookToken?.user).toBe("test");
    expect(webhookToken?.name).toBe("test");
  });

  it("should return null if the webhook token is not found", async () => {
    // setup
    const prisma = testDb.getPrismaClient();
    // act
    const webhookToken = await runWithContext({ prisma }, async () => {
      return await getWebhookByToken("test");
    });
    // assert
    expect(webhookToken).toBeNull();
  });
});
