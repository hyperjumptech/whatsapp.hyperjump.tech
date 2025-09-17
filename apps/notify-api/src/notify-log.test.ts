import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TestDatabase } from "@workspace/database/test-utils";
import { runWithContext } from "@workspace/database/context";
import { getNotifyType, saveNotifyLog } from "./notify-log.js";
import { NotifyType } from "@workspace/database";

describe("notify-log", () => {
  let testDb: TestDatabase;
  beforeEach(async () => {
    testDb = new TestDatabase();
    await testDb.setup();
  });

  afterEach(async () => {
    await testDb.cleanup();
  });

  it("should save notify log", async () => {
    // setup
    const prisma = testDb.getPrismaClient();
    await prisma.users.create({
      data: {
        phoneHash: "test",
        name: "test",
      },
    });
    await runWithContext({ prisma }, async () => {
      return await saveNotifyLog({
        userId: "test",
        type: "start" as NotifyType,
      });
    });

    const notifyLog = await prisma.notify_logs.findFirst({
      where: {
        userId: "test",
        type: "start",
      },
    });
    expect(notifyLog).toBeDefined();
    expect(notifyLog?.userId).toBe("test");
    expect(notifyLog?.type).toBe("start");
  });

  it("should get notify type", async () => {
    const notifyType = getNotifyType("start");
    expect(notifyType).toBe("start");
    const notifyType2 = getNotifyType("incident");
    expect(notifyType2).toBe("incident");
    const notifyType3 = getNotifyType("recovery");
    expect(notifyType3).toBe("recovery");
    const notifyType4 = getNotifyType("status-update");
    expect(notifyType4).toBe("status_update");
    const notifyType5 = getNotifyType("incident-symon");
    expect(notifyType5).toBe("incident");
    const notifyType6 = getNotifyType("recovery-symon");
    expect(notifyType6).toBe("recovery");
  });
});
