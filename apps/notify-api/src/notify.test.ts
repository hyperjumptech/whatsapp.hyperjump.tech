import { TestDatabase } from "@workspace/database/test-utils";
import { afterEach, beforeEach, describe, vi, it, expect } from "vitest";
import { notify } from "./notify.js";
import { runWithContext } from "@workspace/database/context";
import {
  sendIncidentRecoveryMessage,
  sendStartTerminateMessage,
  sendStatusUpdateMessage,
} from "@workspace/whatsapp/send-message";

vi.mock("@workspace/env", () => ({
  env: {
    APP_SECRET: "test",
  },
}));

vi.mock("@workspace/whatsapp/send-message", () => ({
  sendStartTerminateMessage: vi.fn(),
  sendIncidentRecoveryMessage: vi.fn(),
  sendStatusUpdateMessage: vi.fn(),
}));

describe("notify", () => {
  let testDb: TestDatabase;
  beforeEach(async () => {
    testDb = new TestDatabase();
    await testDb.setup();
  });

  afterEach(async () => {
    await testDb.cleanup();
  });

  it("TEST#1: should return TOKEN_NOT_FOUND if the token is not found", async () => {
    // setup
    const prisma = testDb.getPrismaClient();
    // act
    const result = await runWithContext({ prisma }, async () => {
      return await notify({ query: { whatever: "test" }, body: {} });
    });
    // assert
    expect(result).toEqual({ error: "TOKEN_NOT_FOUND", status: 401 });
  });

  it("TEST#2: should return INVALID_REQUEST_BODY if the request body is invalid", async () => {
    // setup
    const prisma = testDb.getPrismaClient();
    // act
    const result = await runWithContext({ prisma }, async () => {
      return await notify({ query: { token: "test" }, body: {} });
    });
    // assert
    expect(result).toEqual({ error: "INVALID_REQUEST_BODY", status: 400 });
  });

  it("TEST#2: should return INVALID_REQUEST_BODY if the action type is invalid", async () => {
    // setup
    const prisma = testDb.getPrismaClient();
    // act
    const result = await runWithContext({ prisma }, async () => {
      return await notify({
        query: { token: "test" },
        body: {
          type: "invalid",
          ip_address: "127.0.0.1",
          alert: "test",
          url: "test",
          time: "test",
          monika: "test",
        },
      });
    });
    // assert
    expect(result).toEqual({ error: "INVALID_REQUEST_BODY", status: 400 });
  });

  it("TEST#3: should return TOKEN_NOT_FOUND if the token is not found", async () => {
    // setup
    const prisma = testDb.getPrismaClient();
    await prisma.webhook_token.create({
      data: {
        token: "invalid-token",
        user: "test",
        name: "test",
      },
    });

    // act
    const result = await runWithContext({ prisma }, async () => {
      return await notify({
        query: { token: "test" },
        body: {
          type: "start",
          ip_address: "127.0.0.1",
          alert: "test",
          url: "test",
          time: "test",
          monika: "test",
        },
      });
    });
    // assert
    expect(result).toEqual({ error: "TOKEN_NOT_FOUND", status: 401 });
  });

  it("TEST#4: should return USER_NOT_FOUND if the user is not found", async () => {
    // setup
    const prisma = testDb.getPrismaClient();
    await prisma.webhook_token.create({
      data: {
        token: "test",
        user: "invalid-user",
        name: "test",
      },
    });

    // act
    const result = await runWithContext({ prisma }, async () => {
      return await notify({
        query: { token: "test" },
        body: {
          type: "start",
          ip_address: "127.0.0.1",
          alert: "test",
          url: "test",
          time: "test",
          monika: "test",
        },
      });
    });
    // assert
    expect(result).toEqual({ error: "USER_NOT_FOUND", status: 401 });
  });

  it("TEST#5: should call sendStartTerminateMessage if the action type is start", async () => {
    // setup
    const prisma = testDb.getPrismaClient();
    await prisma.webhook_token.create({
      data: {
        token: "test",
        user: "test",
        name: "test",
      },
    });
    await prisma.users.create({
      data: {
        phoneHash: "test",
        name: "test",
      },
    });

    // act
    const result = await runWithContext({ prisma }, async () => {
      return await notify({
        query: { token: "test" },
        body: {
          type: "start",
          ip_address: "127.0.0.1",
          alert: "test",
          url: "test",
          time: "test",
          monika: "test",
        },
      });
    });
    // assert
    expect(result).toEqual({ message: "Message sent", status: 200 });
    expect(sendStartTerminateMessage).toHaveBeenCalledWith({
      type: "start",
      phone: "test",
      ipAddress: "127.0.0.1",
    });
  });

  it("TEST#6: should call sendStartTerminateMessage if the action type is terminate", async () => {
    // setup
    const prisma = testDb.getPrismaClient();
    await prisma.webhook_token.create({
      data: {
        token: "test",
        user: "test",
        name: "test",
      },
    });
    await prisma.users.create({
      data: {
        phoneHash: "test",
        name: "test",
      },
    });

    // act
    const result = await runWithContext({ prisma }, async () => {
      return await notify({
        query: { token: "test" },
        body: {
          type: "terminate",
          ip_address: "127.0.0.1",
          alert: "test",
          url: "test",
          time: "test",
          monika: "test",
        },
      });
    });
    // assert
    expect(result).toEqual({ message: "Message sent", status: 200 });
    expect(sendStartTerminateMessage).toHaveBeenCalledWith({
      type: "terminate",
      phone: "test",
      ipAddress: "127.0.0.1",
    });
  });

  it("TEST#7: should call sendIncidentRecoveryMessage if the action type is incident", async () => {
    // setup
    const prisma = testDb.getPrismaClient();
    await prisma.webhook_token.create({
      data: {
        token: "test",
        user: "test",
        name: "test",
      },
    });
    await prisma.users.create({
      data: {
        phoneHash: "test",
        name: "test",
      },
    });

    // act
    const result = await runWithContext({ prisma }, async () => {
      return await notify({
        query: { token: "test" },
        body: {
          type: "incident",
          ip_address: "127.0.0.1",
          alert: "test",
          url: "test",
          time: "test",
          monika: "test",
        },
      });
    });
    // assert
    expect(result).toEqual({ message: "Message sent", status: 200 });
    expect(sendIncidentRecoveryMessage).toHaveBeenCalledWith({
      type: "incident",
      phone: "test",
      alert: "test",
      monika: "test",
      time: "test",
      url: "test",
    });
  });

  it("TEST#8: should call sendIncidentRecoveryMessage if the action type is recovery", async () => {
    // setup
    const prisma = testDb.getPrismaClient();
    await prisma.webhook_token.create({
      data: {
        token: "test",
        user: "test",
        name: "test",
      },
    });
    await prisma.users.create({
      data: {
        phoneHash: "test",
        name: "test",
      },
    });

    // act
    const result = await runWithContext({ prisma }, async () => {
      return await notify({
        query: { token: "test" },
        body: {
          type: "recovery",
          ip_address: "127.0.0.1",
          alert: "test",
          url: "test",
          time: "test",
          monika: "test",
        },
      });
    });
    // assert
    expect(result).toEqual({ message: "Message sent", status: 200 });
    expect(sendIncidentRecoveryMessage).toHaveBeenCalledWith({
      type: "recovery",
      phone: "test",
      alert: "test",
      monika: "test",
      time: "test",
      url: "test",
    });
  });

  it("TEST#9: should call sendIncidentRecoveryMessage if the action type is incident-symon", async () => {
    // setup
    const prisma = testDb.getPrismaClient();
    await prisma.webhook_token.create({
      data: {
        token: "test",
        user: "test",
        name: "test",
      },
    });
    await prisma.users.create({
      data: {
        phoneHash: "test",
        name: "test",
      },
    });

    // act
    const result = await runWithContext({ prisma }, async () => {
      return await notify({
        query: { token: "test" },
        body: {
          type: "incident-symon",
          ip_address: "127.0.0.1",
          alert: "test",
          url: "test",
          time: "test",
          monika: "test",
        },
      });
    });
    // assert
    expect(result).toEqual({ message: "Message sent", status: 200 });
    expect(sendIncidentRecoveryMessage).toHaveBeenCalledWith({
      type: "incident",
      phone: "test",
      alert: "test",
      monika: "test",
      time: "test",
      url: "test",
    });
  });

  it("TEST#10: should call sendIncidentRecoveryMessage if the action type is recovery-symon", async () => {
    // setup
    const prisma = testDb.getPrismaClient();
    await prisma.webhook_token.create({
      data: {
        token: "test",
        user: "test",
        name: "test",
      },
    });
    await prisma.users.create({
      data: {
        phoneHash: "test",
        name: "test",
      },
    });

    // act
    const result = await runWithContext({ prisma }, async () => {
      return await notify({
        query: { token: "test" },
        body: {
          type: "recovery-symon",
          ip_address: "127.0.0.1",
          alert: "test",
          url: "test",
          time: "test",
          monika: "test",
        },
      });
    });
    // assert
    expect(result).toEqual({ message: "Message sent", status: 200 });
    expect(sendIncidentRecoveryMessage).toHaveBeenCalledWith({
      type: "recovery",
      phone: "test",
      alert: "test",
      monika: "test",
      time: "test",
      url: "test",
    });
  });

  it("TEST#11: should call sendStatusUpdateMessage if the action type is status-update", async () => {
    // setup
    const prisma = testDb.getPrismaClient();
    await prisma.webhook_token.create({
      data: {
        token: "test",
        user: "test",
        name: "test",
      },
    });
    await prisma.users.create({
      data: {
        phoneHash: "test",
        name: "test",
      },
    });

    // act
    const result = await runWithContext({ prisma }, async () => {
      return await notify({
        query: { token: "test" },
        body: {
          type: "status-update",
          ip_address: "127.0.0.1",
          time: "test",
          monika: "test",
          numberOfProbes: 1,
          averageResponseTime: 1,
          numberOfIncidents: 1,
          numberOfRecoveries: 1,
          numberOfSentNotifications: 1,
        },
      });
    });
    // assert
    expect(result).toEqual({ message: "Message sent", status: 200 });
    expect(sendStatusUpdateMessage).toHaveBeenCalledWith({
      type: "status-update",
      phone: "test",
      monika: "test",
      time: "test",
      numberOfProbes: "1",
      averageResponseTime: "1",
      numberOfIncidents: "1",
      numberOfRecoveries: "1",
      numberOfSentNotifications: "1",
    });
  });

  it("TEST#12: should return ok if all is good", async () => {
    // setup
    const prisma = testDb.getPrismaClient();
    await prisma.webhook_token.create({
      data: {
        token: "test",
        user: "test",
        name: "test",
      },
    });
    await prisma.users.create({
      data: {
        phoneHash: "test",
        name: "test",
      },
    });

    // act
    const result = await runWithContext({ prisma }, async () => {
      return await notify({
        query: { token: "test" },
        body: {
          type: "status-update",
          ip_address: "127.0.0.1",
          time: "test",
          monika: "test",
          numberOfProbes: 1,
          averageResponseTime: 1,
          numberOfIncidents: 1,
          numberOfRecoveries: 1,
          numberOfSentNotifications: 1,
        },
      });
    });
    // assert
    expect(result).toEqual({ message: "Message sent", status: 200 });
  });
});
