// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestDatabase } from "@workspace/database/test-utils";
import { dbContextStorage, runWithContext } from "@/lib/context/db";
import {
  createOrRefreshRegistration,
  deleteRegistrationByPhoneHash,
  getRegistrationByPhoneHash,
  getRegistrationByToken,
} from "./registrations";
import {
  ContextBuilder,
  runWithMultipleContexts,
} from "@workspace/utils/multiple-contexts";
import { randomContextStorage } from "@workspace/utils/random-context";

describe(`repositories/registrations`, () => {
  let testDb: TestDatabase;

  beforeEach(async () => {
    testDb = new TestDatabase();
    await testDb.setup();
  });

  afterEach(async () => {
    await testDb.cleanup();
  });

  describe(`getRegistrationByPhoneHash`, () => {
    it(`TEST#1: should get a registration by phone hash`, async () => {
      const prisma = testDb.getPrismaClient();

      // setup
      await prisma.registrations.create({
        data: {
          phoneHash: "1234567890",
          token: "1234567890",
          expiredAt: new Date(),
          name: "John Doe",
        },
      });

      // act
      const registration = await runWithContext({ prisma }, async () => {
        return getRegistrationByPhoneHash("1234567890");
      });

      // assert
      expect(registration).toBeDefined();
      expect(registration?.token).toBe("1234567890");
      expect(registration?.name).toBe("John Doe");
      expect(registration?.expiredAt).toBeDefined();
    });
  });

  describe(`getRegistrationByToken`, () => {
    it(`TEST#1: should get a registration by token`, async () => {
      const prisma = testDb.getPrismaClient();

      // setup
      await prisma.registrations.create({
        data: {
          phoneHash: "1234567890",
          token: "1234567890",
          expiredAt: new Date(),
          name: "John Doe",
        },
      });

      // act
      const registration = await runWithContext({ prisma }, async () => {
        return getRegistrationByToken("1234567890");
      });

      // assert
      expect(registration).toBeDefined();
      expect(registration?.token).toBe("1234567890");
    });
  });

  describe(`createOrRefreshRegistration`, () => {
    afterEach(() => {
      vi.clearAllMocks();
    });

    it(`TEST#1: should create a registration`, async () => {
      const prisma = testDb.getPrismaClient();

      // setup
      const registration = await runWithMultipleContexts(
        new ContextBuilder()
          .addContext(dbContextStorage, () => ({ prisma }))
          .addContext(randomContextStorage, () => ({
            uuid: vi.fn().mockReturnValue("1234567890"),
          })),
        async () => {
          return createOrRefreshRegistration(null, "1234567890", "John Doe");
        }
      );

      // assert
      expect(registration).toBeDefined();
      expect(registration?.token).toBe("1234567890");
    });

    it(`TEST#2: should refresh a registration`, async () => {
      const prisma = testDb.getPrismaClient();

      // setup
      const registration = await runWithMultipleContexts(
        new ContextBuilder()
          .addContext(dbContextStorage, () => ({ prisma }))
          .addContext(randomContextStorage, () => ({
            uuid: vi.fn().mockReturnValue("1234567890"),
          })),
        async () => {
          return createOrRefreshRegistration(null, "1234567890", "John Doe");
        }
      );

      // act
      const refreshedRegistration = await runWithMultipleContexts(
        new ContextBuilder()
          .addContext(dbContextStorage, () => ({ prisma }))
          .addContext(randomContextStorage, () => ({
            uuid: vi.fn().mockReturnValue("new-1234567890"),
          })),
        async () => {
          return createOrRefreshRegistration(
            registration,
            "1234567890",
            "Jane Doe"
          );
        }
      );

      // assert
      expect(refreshedRegistration).toBeDefined();
      expect(refreshedRegistration?.token).toBe("new-1234567890");
    });
  });

  describe(`deleteRegistrationByPhoneHash`, () => {
    it(`TEST#1: should delete a registration by phone hash`, async () => {
      const prisma = testDb.getPrismaClient();

      // setup
      await prisma.registrations.create({
        data: {
          phoneHash: "1234567890",
          token: "1234567890",
          expiredAt: new Date(),
          name: "John Doe",
        },
      });

      // act
      await runWithContext({ prisma }, async () => {
        return deleteRegistrationByPhoneHash("1234567890");
      });

      // assert
      const registration = await prisma.registrations.findUnique({
        where: {
          phoneHash: "1234567890",
        },
      });
      expect(registration).toBeNull();
    });
  });
});
