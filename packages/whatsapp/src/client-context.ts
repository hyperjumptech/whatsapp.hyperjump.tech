/**
 * This file contains the whatsapp client context for the application.
 * The whatsapp client context is used to provide a whatsapp client to the application.
 *
 * Any function can access the whatsapp client by calling the `getWhatsappClient` function.
 *
 * The `getWhatsappClient` function returns the whatsapp client from the async local storage.
 *
 * However, that function needs to be called within the context of the `whatsappClientStorage`.
 *
 * To facilitate this, there are three helpers you can use:
 *
 * 1. withWhatsappClient: This is a HOC that allows you wrap a **React server component** so that it can access the whatsapp client.
 * 2. withWhatsappClientAction: This is a HOC that allows you wrap a **server form action** so that it can access the whatsapp client.
 * 3. withWhatsappClientFunction: This is a HOC that allows you wrap a **server function** so that it can access the whatsapp client.
 *
 */
import { AsyncLocalStorage } from "async_hooks";
import { WhatsappClient } from "./client.js";

export interface WhatsappClientContext {
  whatsappClient: WhatsappClient;
}

export const whatsappClientStorage =
  new AsyncLocalStorage<WhatsappClientContext>();

/**
 * This function returns the default whatsapp client context.
 * @returns The default whatsapp client context which is the shared whatsapp client singleton.
 */
export const defaultWhatsappClientContext: () => WhatsappClientContext =
  () => ({
    // TEST#5
    whatsappClient: new WhatsappClient(),
  });

/**
 * This function gets the whatsapp client context from the async local storage.
 * @returns The whatsapp client context.
 */
export function getWhatsappClientContext(): WhatsappClientContext {
  const context = whatsappClientStorage.getStore();
  if (!context) {
    // TEST#1
    throw new Error(
      "Whatsapp client context not initialized. The entry function needs to be called within whatsappClientStorage.run()"
    );
  }
  return context;
}

/**
 * This function runs a function with the default whatsapp client context.
 * @param fn - The function to run.
 * @returns The result of the function.
 */
export function runWithDefaultContext<T>(fn: () => T): T {
  return whatsappClientStorage.run(defaultWhatsappClientContext(), fn);
}

/**
 * This function runs a function with the given whatsapp client context.
 * @param context - The whatsapp client context to use.
 * @param fn - The function to run.
 * @returns The result of the function.
 */
export function runWithContext<T>(
  context: WhatsappClientContext,
  fn: () => T
): T {
  // TEST#2
  return whatsappClientStorage.run(context, fn);
}

/**
 * This is a HOC that allows you to wrap a **server form action** so that it can access the whatsapp client context.
 * @param withWhatsappClientImpl - The function to wrap.
 * @param whatsappClient - The whatsapp client to use. If not provided, the default shared whatsapp client singleton will be used.
 * @returns The wrapped function.
 */
export const withWhatsappClientAction =
  <Output>(
    withWhatsappClientImpl: (
      _prevState: Output,
      formData: FormData
    ) => Promise<Output>,
    whatsappClient: WhatsappClient = new WhatsappClient()
  ) =>
  // TEST#4
  async (_prevState: Output, formData: FormData) => {
    return runWithContext({ whatsappClient }, () =>
      withWhatsappClientImpl(_prevState, formData)
    );
  };

/**
 * This is a HOC that allows you to wrap a **server function** so that it can access the whatsapp client context.
 * @param fn - The function to wrap.
 * @param whatsappClient - The whatsapp client to use. If not provided, the default shared whatsapp client singleton will be used.
 * @returns The wrapped function.
 */
export const withWhatsappClientFunction = <Args extends any[], Output>(
  fn: (...args: Args) => Promise<Output>,
  whatsappClient: WhatsappClient = new WhatsappClient()
) => {
  // TEST#3
  return async (...args: Args): Promise<Output> => {
    return runWithContext({ whatsappClient }, () => fn(...args));
  };
};
