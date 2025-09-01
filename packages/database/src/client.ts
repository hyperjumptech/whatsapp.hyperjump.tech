import { Prisma, PrismaClient } from "./generated";

export class PrismaClientWithSchema extends PrismaClient {
  private currentSchema: string = "public";

  constructor(url?: string, log?: (Prisma.LogLevel | Prisma.LogDefinition)[]) {
    // Determine log level based on environment
    let defaultLogLevel: (Prisma.LogLevel | Prisma.LogDefinition)[] = [
      "warn",
      "error",
    ];

    // Check if we're in a test environment
    const isTestEnv =
      process.env.NODE_ENV === "test" ||
      process.env.VITEST === "true" ||
      process.env.JEST_WORKER_ID !== undefined;

    if (isTestEnv) {
      // In test environment, only show errors
      defaultLogLevel = ["error"];
    } else if (process.env.NODE_ENV === "development") {
      defaultLogLevel = ["info", "warn", "error"];
    } else if (process.env.PRISMA_LOG_LEVEL) {
      // Allow override via environment variable
      const envLogLevel = process.env.PRISMA_LOG_LEVEL.toLowerCase();
      if (envLogLevel === "info") {
        defaultLogLevel = ["info", "warn", "error"];
      } else if (envLogLevel === "warn") {
        defaultLogLevel = ["warn", "error"];
      } else if (envLogLevel === "error") {
        defaultLogLevel = ["error"];
      } else if (envLogLevel === "none") {
        defaultLogLevel = [];
      }
    }

    super({
      datasourceUrl: url,
      log: log || defaultLogLevel,
      errorFormat: "minimal",
    });
  }

  async useSchema(schema: string) {
    this.currentSchema = schema;

    await this.$disconnect();

    await this.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);

    // Set schema for all queries in this connection
    await this.$executeRawUnsafe(`SET search_path TO "${schema}"`);
  }

  getCurrentSchema() {
    return this.currentSchema;
  }
}

let prismaClient: PrismaClientWithSchema;

if (!(global as any).prismaClient) {
  (global as any).prismaClient = new PrismaClientWithSchema();
}

prismaClient = (global as any).prismaClient;

export { prismaClient };
