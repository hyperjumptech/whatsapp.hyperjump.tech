import { beforeAll } from "vitest";

// Set environment variables to suppress Prisma logs during tests
beforeAll(() => {
  process.env.PRISMA_LOG_LEVEL = "warn";
  process.env.DEBUG = "";
  process.env.VITEST = "true";
});
