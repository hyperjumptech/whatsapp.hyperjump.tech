/**
 * This file contains the random context for the application.
 * The random context is used to generate unique identifiers for the application.
 *
 * Any function can access the uuid function by calling the `getRandomContext` function.
 *
 * The `getRandomContext` function returns the random context from the async local storage.
 *
 * However, that function needs to be called within the context of the `randomContextStorage`.
 *
 * To facilitate this, there are three helpers you can use:
 *
 * 1. withRandomContext: This is a HOC that allows you wrap a **React server component** so that it can access the random context.
 * 2. withRandomContextAction: This is a HOC that allows you wrap a **server form action** so that it can access the random context.
 * 3. withRandomContextFunction: This is a HOC that allows you wrap a **server function** so that it can access the random context.
 */
import { AsyncLocalStorage } from "async_hooks";
import { v4 as uuidv4 } from "uuid";

export interface RandomContext {
  uuid: typeof uuidv4;
}

export const randomContextStorage = new AsyncLocalStorage<RandomContext>();

/**
 * This function returns the default random context.
 * @returns The default random context which is the shared uuid function singleton.
 */
export const defaultRandomContext: () => RandomContext = () => ({
  // TEST#6
  uuid: uuidv4,
});

/**
 * This function gets the random context from the async local storage.
 * @returns The random context.
 */
export function getRandomContext(): RandomContext {
  const context = randomContextStorage.getStore();
  if (!context) {
    // TEST#1
    throw new Error(
      "Random context not initialized. The entry function needs to be called within randomContextStorage.run()"
    );
  }
  return context;
}

/**
 * This function runs a function with the default random context.
 * @param fn - The function to run.
 * @returns The result of the function.
 */
export function runWithDefaultContext<T>(fn: () => T): T {
  return randomContextStorage.run(defaultRandomContext(), fn);
}

/**
 * This function runs a function with the given random context.
 * @param context - The random context to use.
 * @param fn - The function to run.
 * @returns The result of the function.
 */
export function runWithContext<T>(context: RandomContext, fn: () => T): T {
  // TEST#2
  return randomContextStorage.run(context, fn);
}

/**
 * This is a HOC that allows you to wrap a **React server component** so that it can access the random context.
 * @param Component - The component to wrap.
 * @param uuid - The uuid function to use. If not provided, the default shared uuid function singleton will be used.
 * @returns The wrapped component.
 */
export const withRandomContext = <P extends {}>(
  Component: (props: P) => Promise<React.ReactNode> | React.ReactNode,
  context: RandomContext = defaultRandomContext()
) =>
  // TEST#5
  async function WrappedComponent(props: P) {
    return runWithContext(context, () => Component(props));
  };

/**
 * This is a HOC that allows you to wrap a **server form action** so that it can access the random context.
 * @param withRandomContextImpl - The function to wrap.
 * @param uuid - The uuid function to use. If not provided, the default shared uuid function singleton will be used.
 * @returns The wrapped function.
 */
export const withRandomContextAction =
  <Output>(
    withRandomContextImpl: (
      _prevState: Output,
      formData: FormData
    ) => Promise<Output>,
    context: RandomContext = defaultRandomContext()
  ) =>
  // TEST#4
  async (_prevState: Output, formData: FormData) => {
    return runWithContext(context, () =>
      withRandomContextImpl(_prevState, formData)
    );
  };

/**
 * This is a HOC that allows you to wrap a **server function** so that it can access the random context.
 * @param fn - The function to wrap.
 * @param context - The random context to use.
 * @returns The wrapped function.
 */
export const withRandomContextFunction = <Args extends any[], Output>(
  fn: (...args: Args) => Promise<Output>,
  context: RandomContext = defaultRandomContext()
) => {
  // TEST#3
  return async (...args: Args): Promise<Output> => {
    return runWithContext(context, () => fn(...args));
  };
};
