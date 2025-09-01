// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestDatabase } from "@workspace/database/test-utils";
import { dbContextStorage, runWithContext } from "@/lib/context/db";
import {
  deleteWebhookByToken,
  getWebhookByToken,
  getWebhookByUser,
  saveWebhookToken,
  updateWebhookResendAt,
} from "./webhook-token";
import {
  ContextBuilder,
  runWithMultipleContexts,
} from "@workspace/utils/multiple-contexts";
import { timeContextStorage } from "@workspace/utils/time-context";
import { env } from "@workspace/env";

vi.mock("@workspace/env", () => ({
  env: {
    NEXT_PUBLIC_WEBHOOK_RESEND_COOLDOWN_TIME: 10,
  },
}));

describe(`repositories/webhook-token`, () => {
  let testDb: TestDatabase;

  beforeEach(async () => {
    testDb = new TestDatabase();
    await testDb.setup();
  });

  afterEach(async () => {
    await testDb.cleanup();
    vi.clearAllMocks();
  });

  it(`TEST#1: should save a webhook token`, async () => {
    const prisma = testDb.getPrismaClient();

    // act
    const webhookToken = await runWithContext({ prisma }, async () => {
      return saveWebhookToken("name", "user");
    });

    // assert
    expect(webhookToken).toBeDefined();
    expect(webhookToken?.name).toBe("name");
    expect(webhookToken?.user).toBe("user");
  });

  it(`TEST#2: should get a webhook token by token`, async () => {
    const prisma = testDb.getPrismaClient();

    await prisma.webhook_token.create({
      data: {
        token: "token",
        name: "name",
        user: "user",
      },
    });

    // act
    const webhookToken = await runWithContext({ prisma }, async () => {
      return getWebhookByToken("token");
    });

    // assert
    expect(webhookToken).toBeDefined();
    expect(webhookToken?.token).toBe("token");
  });

  it(`TEST#3: should delete a webhook token by token`, async () => {
    const prisma = testDb.getPrismaClient();

    await prisma.webhook_token.create({
      data: {
        token: "token",
        name: "name",
        user: "user",
      },
    });

    // act
    await runWithContext({ prisma }, async () => {
      return deleteWebhookByToken("token");
    });

    // assert
    const webhookToken = await prisma.webhook_token.findUnique({
      where: {
        token: "token",
      },
    });
    expect(webhookToken).toBeNull();
  });

  it(`TEST#4: should get a webhook token by user`, async () => {
    const prisma = testDb.getPrismaClient();

    await prisma.webhook_token.create({
      data: {
        token: "token",
        name: "name",
        user: "user",
      },
    });

    // act
    const webhookToken = await runWithContext({ prisma }, async () => {
      return getWebhookByUser("user");
    });

    // assert
    expect(webhookToken).toBeDefined();
    expect(webhookToken?.token).toBe("token");
  });

  it(`TEST#5: should update the resend at of a webhook token using the default cooldown time`, async () => {
    // setup
    vi.mocked(env).NEXT_PUBLIC_WEBHOOK_RESEND_COOLDOWN_TIME = undefined;
    const prisma = testDb.getPrismaClient();

    await prisma.webhook_token.create({
      data: {
        token: "token",
        name: "name",
        user: "user",
      },
    });

    const fakeNow = new Date();

    // act
    await runWithMultipleContexts(
      new ContextBuilder()
        .addContext(dbContextStorage, () => ({ prisma }))
        .addContext(timeContextStorage, () => ({ now: () => fakeNow })),
      async () => {
        return updateWebhookResendAt("token");
      }
    );

    // assert
    const webhookToken = await prisma.webhook_token.findUnique({
      where: {
        token: "token",
      },
    });
    expect(webhookToken).toBeDefined();
    expect(webhookToken?.resendAt?.getTime()).toBe(
      fakeNow.getTime() + 15 * 60 * 1000
    );
  });

  it(`TEST#5: should update the resend at of a webhook token using the environment cooldown time`, async () => {
    // setup
    vi.mocked(env).NEXT_PUBLIC_WEBHOOK_RESEND_COOLDOWN_TIME = 10;
    const prisma = testDb.getPrismaClient();

    await prisma.webhook_token.create({
      data: {
        token: "token",
        name: "name",
        user: "user",
      },
    });

    const fakeNow = new Date();

    // act
    await runWithMultipleContexts(
      new ContextBuilder()
        .addContext(dbContextStorage, () => ({ prisma }))
        .addContext(timeContextStorage, () => ({ now: () => fakeNow })),
      async () => {
        return updateWebhookResendAt("token");
      }
    );

    // assert
    const webhookToken = await prisma.webhook_token.findUnique({
      where: {
        token: "token",
      },
    });
    expect(webhookToken).toBeDefined();
    expect(webhookToken?.resendAt?.getTime()).toBe(
      fakeNow.getTime() + 10 * 1000
    );
  });
});
