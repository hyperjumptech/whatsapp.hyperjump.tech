import { prismaClient } from "@workspace/database/client";
import { dbContextStorage } from "./db";
import {
  ContextBuilder,
  runWithMultipleContexts,
} from "@workspace/utils/multiple-contexts";
import { randomContextStorage } from "@workspace/utils/random-context";
import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "@workspace/database";
import { WhatsappClient } from "@workspace/whatsapp/client";
import { whatsappClientStorage } from "./whatsapp";
import {
  defaultTimeContext,
  TimeContext,
  timeContextStorage,
} from "@workspace/utils/time-context";

/**
 * This function wraps a function with all the necessary contexts: db context and random context.
 * @param fn - The function to wrap.
 * @param prisma - The prisma client to use. If not provided, the default shared prisma client singleton will be used.
 * @param uuid - The uuid function to use. If not provided, the default shared uuid function singleton will be used.
 * @param whatsappClient - The whatsapp client to use. If not provided, the default shared whatsapp client singleton will be used.
 * @param time - The time to use. If not provided, the default shared time singleton will be used.
 * @returns The wrapped function.
 */
export const withAllContexts = <Args extends any[], Output>(
  fn: (...args: Args) => Promise<Output>,
  prisma: PrismaClient = prismaClient,
  uuid: typeof uuidv4 = uuidv4,
  whatsappClient: WhatsappClient = new WhatsappClient(),
  time: TimeContext = defaultTimeContext()
) => {
  // TEST#1
  return async (...args: Args): Promise<Output> => {
    return runWithMultipleContexts(
      new ContextBuilder()
        .addContext(dbContextStorage, () => ({ prisma }))
        .addContext(randomContextStorage, () => ({ uuid }))
        .addContext(whatsappClientStorage, () => ({ whatsappClient }))
        .addContext(timeContextStorage, () => time),
      () => fn(...args)
    );
  };
};

/**
 * This HOC wraps the given function with all the necessary contexts: db context, random context and whatsapp client context.
 * @param fn - The function to create.
 * @returns The created function.
 */
export const functionCreator = <Args extends any[], Output>(
  fn: (...args: Args) => Promise<Output>
) => {
  // TEST#2
  return (
    prisma?: PrismaClient,
    uuid?: typeof uuidv4,
    whatsappClient?: WhatsappClient,
    time?: TimeContext
  ) => withAllContexts(fn, prisma, uuid, whatsappClient, time);
};
