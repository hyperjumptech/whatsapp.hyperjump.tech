import "@testing-library/jest-dom";
import { expect, test, describe, beforeEach, afterEach, vi } from "vitest";
import { DeletePage } from "./delete-page";
import { renderServerComponent } from "@workspace/utils/test-async-rsc";
import { TestDatabase } from "@workspace/database/test-utils";
import { withDbContext } from "@/lib/context/db";
import { notFound } from "next/navigation";

// mock the env module to avoid this error: Attempted to access a server-side environment variable on the client
vi.mock("@workspace/env", () => ({
  env: {
    NEXT_PUBLIC_BASE_URL: "https://webhook.site",
  },
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

vi.mock("server-only", () => ({
  default: vi.fn(),
}));

describe("DeletePage", () => {
  let testDb: TestDatabase;

  beforeEach(async () => {
    testDb = new TestDatabase();
    await testDb.setup();
  });

  afterEach(async () => {
    await testDb.cleanup();
  });

  test("TEST#1: should render the page when the token exists", async () => {
    // setup
    const prisma = testDb.getPrismaClient();
    await prisma.webhook_token.create({
      data: {
        token: "123",
        user: "1234567890",
        name: "John Doe",
      },
    });

    const ComponentToTest = withDbContext(DeletePage, prisma);

    const { getByText } = await renderServerComponent(
      <ComponentToTest params={Promise.resolve({ token: "123" })} />
    );
    expect(getByText("Delete Account")).toBeInTheDocument();
  });

  test("TEST#2: should call notFound when token does not exist", async () => {
    const ComponentToTest = withDbContext(DeletePage, testDb.getPrismaClient());
    await renderServerComponent(
      <ComponentToTest params={Promise.resolve({ token: "123" })} />
    );
    expect(notFound).toHaveBeenCalled();
  });
});
