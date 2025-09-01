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
import { WhatsappClient } from "@workspace/whatsapp/client";
import {
  runWithContext,
  defaultWhatsappClientContext,
  withWhatsappClientAction,
  getWhatsappClientContext,
  withWhatsappClientFunction,
  whatsappClientStorage,
  runWithDefaultContext,
} from "@workspace/whatsapp/client-context";

/**
 * This is a HOC that allows you to wrap a **React server component** so that it can access the whatsapp client context.
 * @param Component - The component to wrap.
 * @param whatsappClient - The whatsapp client to use. If not provided, the default shared whatsapp client singleton will be used.
 * @returns The wrapped component.
 */
export const withWhatsappClient = <P extends {}>(
  Component: (props: P) => Promise<React.ReactNode> | React.ReactNode,
  whatsappClient: WhatsappClient = new WhatsappClient()
) =>
  async function WrappedComponent(props: P) {
    return runWithContext({ whatsappClient }, () => Component(props));
  };

// re-export the whatsapp client context helpers from @workspace/whatsapp/client-context. withWhatsappClient above is not in the @workspace/whatsapp/client-context to keep the whatsapp package minimum without React dependencies.
export {
  defaultWhatsappClientContext,
  withWhatsappClientAction,
  getWhatsappClientContext,
  withWhatsappClientFunction,
  whatsappClientStorage,
  runWithDefaultContext,
};
