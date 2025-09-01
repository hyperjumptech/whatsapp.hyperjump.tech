import { beforeEach, describe, it, expect, vi, afterEach } from "vitest";
import { getDbContext } from "./db";
import { getRandomContext } from "@workspace/utils/random-context";
import { getWhatsappClientContext } from "./whatsapp";
import { getTimeContext } from "@workspace/utils/time-context";
import { TestDatabase } from "@workspace/database/test-utils";
import { functionCreator, withAllContexts } from "./helper";
import { v4 as uuidv4 } from "uuid";
import { WhatsappClient } from "@workspace/whatsapp/client";

vi.mock("uuid", () => ({
  v4: vi.fn().mockReturnValue("1234567890"),
}));

vi.mock("@workspace/whatsapp/client", () => ({
  WhatsappClient: vi.fn().mockImplementation(() => ({
    send: vi.fn(),
  })),
}));

describe("context helpers", () => {
  let testDb: TestDatabase;
  beforeEach(async () => {
    testDb = new TestDatabase();
    await testDb.setup();
  });
  afterEach(async () => {
    await testDb.cleanup();
  });
  it("TEST#1: should wrap the function with the all contexts", async () => {
    // setup
    const action = async (name: string) => {
      const { prisma } = getDbContext();
      const { uuid } = getRandomContext();
      const { whatsappClient } = getWhatsappClientContext();
      const { now } = getTimeContext();

      const count = await prisma.users.count();
      const randomUuid = uuid();
      const dateTime = now().getTime();
      await whatsappClient.send("template", ["a"], "b");

      return {
        count,
        randomUuid,
        dateTime,
        name,
      };
    };

    const prisma = testDb.getPrismaClient();
    await prisma.users.createMany({
      data: [
        {
          phoneHash: "1234567890",
          name: "John Doe",
        },
        {
          phoneHash: "1234567891",
          name: "Jane Doe",
        },
      ],
    });

    vi.mocked(uuidv4).mockReturnValue("1234567890" as any);

    // execute
    const wrappedAction = withAllContexts(
      action,
      prisma,
      uuidv4,
      new WhatsappClient(),
      {
        now: vi.fn().mockReturnValue(new Date("2025-01-01")),
      }
    );

    const result = await wrappedAction("John Doe");

    // assert
    expect(result).deep.equal({
      count: 2,
      randomUuid: "1234567890",
      dateTime: new Date("2025-01-01").getTime(),
      name: "John Doe",
    });
  });

  it("TEST#2: should create a new function with the all contexts", async () => {
    // setup
    const action = async (name: string) => {
      const { prisma } = getDbContext();
      const { uuid } = getRandomContext();
      const { whatsappClient } = getWhatsappClientContext();
      const { now } = getTimeContext();

      const count = await prisma.users.count();
      const randomUuid = uuid();
      const dateTime = now().getTime();
      await whatsappClient.send("template", ["a"], "b");

      return {
        count,
        randomUuid,
        dateTime,
        name,
      };
    };

    const prisma = testDb.getPrismaClient();
    await prisma.users.createMany({
      data: [
        {
          phoneHash: "1234567890",
          name: "John Doe",
        },
        {
          phoneHash: "1234567891",
          name: "Jane Doe",
        },
      ],
    });

    vi.mocked(uuidv4).mockReturnValue("1234567890" as any);

    // execute
    const actionCreator = functionCreator(action);
    const wrappedAction = actionCreator(prisma, uuidv4, new WhatsappClient(), {
      now: vi.fn().mockReturnValue(new Date("2025-01-01")),
    });

    const result = await wrappedAction("John Doe");

    // assert
    expect(result).deep.equal({
      count: 2,
      randomUuid: "1234567890",
      dateTime: new Date("2025-01-01").getTime(),
      name: "John Doe",
    });
  });
});
