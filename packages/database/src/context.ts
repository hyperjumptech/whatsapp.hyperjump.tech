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
import { AsyncLocalStorage } from "async_hooks";
import { prismaClient } from "./client";
import { PrismaClient } from "./generated";

export interface DbContext {
  prisma: PrismaClient;
}

export const dbContextStorage = new AsyncLocalStorage<DbContext>();

/**
 * This function returns the default db context.
 * @returns The default db context which is the shared prisma client singleton.
 */
export const defaultDbContext: () => DbContext = () => ({
  prisma: prismaClient,
});

/**
 * This function gets the db context from the async local storage.
 * @returns The db context.
 */
export function getDbContext(): DbContext {
  const context = dbContextStorage.getStore();
  if (!context) {
    throw new Error(
      "Db context not initialized. The entry function needs to be called within dbContextStorage.run()"
    );
  }
  return context;
}

/**
 * This function runs a function with the default db context.
 * @param fn - The function to run.
 * @returns The result of the function.
 */
export function runWithDefaultContext<T>(fn: () => T): T {
  return dbContextStorage.run(defaultDbContext(), fn);
}

/**
 * This function runs a function with the given db context.
 * @param context - The db context to use.
 * @param fn - The function to run.
 * @returns The result of the function.
 */
export function runWithContext<T>(context: DbContext, fn: () => T): T {
  return dbContextStorage.run(context, fn);
}

/**
 * This is a HOC that allows you to wrap a **server form action** so that it can access the db context.
 * @param withDbContextImpl - The function to wrap.
 * @param prisma - The prisma client to use. If not provided, the default shared prisma client singleton will be used.
 * @returns The wrapped function.
 */
export const withDbContextAction =
  <Output>(
    withDbContextImpl: (
      _prevState: Output,
      formData: FormData
    ) => Promise<Output>,
    prisma: PrismaClient = prismaClient
  ) =>
  async (_prevState: Output, formData: FormData) => {
    return runWithContext({ prisma }, () =>
      withDbContextImpl(_prevState, formData)
    );
  };

/**
 * This is a HOC that allows you to wrap a **server function** so that it can access the db context.
 * @param fn - The function to wrap.
 * @param prisma - The prisma client to use. If not provided, the default shared prisma client singleton will be used.
 * @returns The wrapped function.
 */
export const withDbContextFunction = <Args extends any[], Output>(
  fn: (...args: Args) => Promise<Output>,
  prisma: PrismaClient = prismaClient
) => {
  return async (...args: Args): Promise<Output> => {
    return runWithContext({ prisma }, () => fn(...args));
  };
};
