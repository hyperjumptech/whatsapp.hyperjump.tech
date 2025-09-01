import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { saveWebhookLog } from "./webhook-log.js";
import { TestDatabase } from "@workspace/database/test-utils";
import { runWithContext } from "@workspace/database/context";

describe("saveWebhookLog", () => {
  let testDb: TestDatabase;
  beforeEach(async () => {
    testDb = new TestDatabase();
    await testDb.setup();
  });

  afterEach(async () => {
    await testDb.cleanup();
  });

  it("should save webhook log", async () => {
    const result = await runWithContext(
      { prisma: testDb.getPrismaClient() },
      async () => {
        const logs = "test";
        return await saveWebhookLog(logs);
      }
    );
    expect(result).toBeDefined();
    const webhookLog = await testDb.getPrismaClient().webhook_logs.findFirst({
      where: {
        id: result.id,
      },
    });
    expect(webhookLog).toBeDefined();
    expect(webhookLog?.logs).toBe("test");
  });
});
