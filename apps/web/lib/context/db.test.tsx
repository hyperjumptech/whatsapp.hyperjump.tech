import "@testing-library/jest-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderServerComponent } from "@workspace/utils/test-async-rsc";
import { getDbContext, withDbContext } from "./db";
import { TestDatabase } from "@workspace/database/test-utils";

vi.mock("@workspace/env", () => ({
  env: {
    DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/postgres",
  },
}));

describe("withDbContext", () => {
  let testDb: TestDatabase;
  beforeEach(async () => {
    testDb = new TestDatabase();
    await testDb.setup();
  });
  afterEach(async () => {
    await testDb.cleanup();
  });
  it("should wrap the component with the db context", async () => {
    const prisma = testDb.getPrismaClient();
    await prisma.users.create({
      data: {
        phoneHash: "1234567890",
        name: "John Doe",
      },
    });

    const MainComponent = async () => {
      const { prisma } = getDbContext();
      const users = await prisma.users.findMany({});
      return (
        <div>
          {users.map((user) => (
            <div key={user.phoneHash}>{user.name}</div>
          ))}
        </div>
      );
    };

    const Component = withDbContext(MainComponent, prisma);
    expect(Component).toBeDefined();

    const { getByText } = await renderServerComponent(<Component />);

    expect(getByText("John Doe")).toBeInTheDocument();
  });
});
