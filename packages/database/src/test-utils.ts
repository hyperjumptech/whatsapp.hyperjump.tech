import { PrismaClientWithSchema } from "@workspace/database/client";
import { execSync } from "child_process";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const dbUrl = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@localhost:5432`;

export class TestDatabase {
  private schemaName: string;
  private prismaClient: PrismaClientWithSchema;
  private dbUrl: string;
  private dbName: string;

  constructor() {
    this.dbName = `monika-notif-engine-${uuidv4()}`;
    this.dbUrl = `${dbUrl}/${this.dbName}`;

    this.schemaName = `test_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 11)}`;

    const url = new URL(this.dbUrl);
    url.searchParams.set("schema", this.schemaName);
    this.prismaClient = new PrismaClientWithSchema(url.toString());
  }

  private async createDatabaseIfNotExists() {
    // Connect to default postgres database to check/create new database
    const defaultClient = new PrismaClientWithSchema(`${dbUrl}/postgres`, [
      "error",
    ]);

    try {
      // Check if database exists
      const result = await defaultClient.$executeRawUnsafe(
        `SELECT 1 FROM pg_database WHERE datname = '${this.dbName}'`
      );

      if (!result) {
        // Create database if it doesn't exist
        await defaultClient.$executeRawUnsafe(
          `CREATE DATABASE "${this.dbName}"`
        );
      }
    } catch (error) {
      console.error(`Error creating database ${this.dbName}:`, error);
    } finally {
      await defaultClient.$disconnect();
    }
  }

  async setup() {
    await this.createDatabaseIfNotExists();

    await this.prismaClient.$executeRawUnsafe(
      `CREATE SCHEMA IF NOT EXISTS "${this.schemaName}"`
    );
    await this.prismaClient.useSchema(this.schemaName);

    await this.runMigrations();
  }

  private async runMigrations() {
    // the path to the directory that contains prisma/schema.prisma
    const dbPrismaSchemaPath = path.resolve(
      process.cwd(),
      "../..",
      "packages/database"
    );
    const originalUrl = process.env.DATABASE_URL;

    try {
      const url = new URL(this.dbUrl);
      url.searchParams.set("schema", this.schemaName);

      // Run prisma migrate
      execSync("npx prisma migrate deploy", {
        // @ts-ignore
        env: {
          ...process.env,
          DATABASE_URL: url.toString(),
          DATABASE_DIRECT_URL: url.toString(),
        },
        stdio: "ignore",
        cwd: dbPrismaSchemaPath,
      });
    } catch (error) {
      console.error(`Error running migrations:`, error);
    }
  }

  async cleanup() {
    // Disconnect the schema-specific client
    await this.prismaClient.$disconnect();

    // Create a temporary client to drop the schema
    const cleanupClient = new PrismaClientWithSchema();
    await cleanupClient.$executeRawUnsafe(
      `DROP SCHEMA IF EXISTS "${this.schemaName}" CASCADE`
    );
    await cleanupClient.$disconnect();
  }

  getPrismaClient() {
    return this.prismaClient;
  }
}
