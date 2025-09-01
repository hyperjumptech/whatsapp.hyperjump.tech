/**
 * This file contains the db context for the application.
 * The db context is used to provide a prisma client to the application.
 *
 * Any function can access the db client (prisma client) by calling the `getDbContext` function.
 *
 * The `getDbContext` function returns the db context from the async local storage.
 *
 * However, that function needs to be called within the context of the `dbContextStorage`.
 *
 * To facilitate this, there are three helpers you can use:
 *
 * 1. withDbContext: This is a HOC that allows you wrap a **React server component** so that it can access the db context.
 * 2. withDbContextAction: This is a HOC that allows you wrap a **server form action** so that it can access the db context.
 * 3. withDbContextFunction: This is a HOC that allows you wrap a **server function** so that it can access the db context.
 *
 */
import { prismaClient } from "@workspace/database/client";
import { PrismaClient } from "@workspace/database";
import {
  withDbContextAction,
  withDbContextFunction,
  runWithContext,
  runWithDefaultContext,
  getDbContext,
  dbContextStorage,
} from "@workspace/database/context";

/**
 * This is a HOC that allows you to wrap a **React server component** so that it can access the db context.
 * @param Component - The component to wrap.
 * @param prisma - The prisma client to use. If not provided, the default shared prisma client singleton will be used.
 * @returns The wrapped component.
 */
export const withDbContext = <P extends {}>(
  Component: (props: P) => Promise<React.ReactNode> | React.ReactNode,
  prisma: PrismaClient = prismaClient
) =>
  async function WrappedComponent(props: P) {
    return runWithContext({ prisma }, () => Component(props));
  };

// re-export the db context helpers from @workspace/database/context. withDbContext above is not in the @workspace/database/context to keep the database package minimum without React dependencies.
export {
  withDbContextAction,
  withDbContextFunction,
  runWithContext,
  runWithDefaultContext,
  getDbContext,
  dbContextStorage,
};
