/**
 * This file contains the time context for the application.
 * The time context is used to provide a time to the application.
 *
 * Any function can access the time by calling the `getTimeContext` function.
 *
 * The `getTimeContext` function returns the time context from the async local storage.
 *
 * However, that function needs to be called within the context of the `timeContextStorage`.
 *
 * To facilitate this, there are three helpers you can use:
 *
 * 1. withTimeContext: This is a HOC that allows you wrap a **React server component** so that it can access the time context.
 * 2. withTimeContextAction: This is a HOC that allows you wrap a **server form action** so that it can access the time context.
 * 3. withTimeContextFunction: This is a HOC that allows you wrap a **server function** so that it can access the time context.
 *
 */
import { AsyncLocalStorage } from "async_hooks";

export interface TimeContext {
  now: () => Date;
}

export const timeContextStorage = new AsyncLocalStorage<TimeContext>();

/**
 * This function returns the default time context.
 * @returns The default time context which is the shared time context singleton.
 */
export const defaultTimeContext: () => TimeContext = () => ({
  now: () => new Date(),
});

/**
 * This function gets the time context from the async local storage.
 * @returns The time context.
 */
export function getTimeContext(): TimeContext {
  const context = timeContextStorage.getStore();
  if (!context) {
    // TEST#1
    throw new Error(
      "Time context not initialized. The entry function needs to be called within timeContextStorage.run()"
    );
  }
  // TEST#2
  return context;
}

/**
 * This function runs a function with the default time context.
 * @param fn - The function to run.
 * @returns The result of the function.
 */
export function runWithDefaultContext<T>(fn: () => T): T {
  // TEST#6
  return timeContextStorage.run(defaultTimeContext(), fn);
}

/**
 * This function runs a function with the given time context.
 * @param context - The time context to use.
 * @param fn - The function to run.
 * @returns The result of the function.
 */
export function runWithContext<T>(context: TimeContext, fn: () => T): T {
  // TEST#2
  return timeContextStorage.run(context, fn);
}

/**
 * This is a HOC that allows you to wrap a **React server component** so that it can access the time context.
 * @param Component - The component to wrap.
 * @returns The wrapped component.
 */
export const withTimeContext = <P extends {}>(
  Component: (props: P) => Promise<React.ReactNode> | React.ReactNode,
  context: TimeContext = defaultTimeContext()
) =>
  // TEST#5
  async function WrappedComponent(props: P) {
    return runWithContext(context, () => Component(props));
  };

/**
 * This is a HOC that allows you to wrap a **server form action** so that it can access the time context.
 * @param withTimeContextImpl - The function to wrap.
 * @returns The wrapped function.
 */
export const withTimeContextAction =
  <Output>(
    withTimeContextImpl: (
      _prevState: Output,
      formData: FormData,
      context: TimeContext
    ) => Promise<Output>,
    context: TimeContext = defaultTimeContext()
  ) =>
  // TEST#4
  async (_prevState: Output, formData: FormData) => {
    return runWithContext(context, () =>
      withTimeContextImpl(_prevState, formData, context)
    );
  };

/**
 * This is a HOC that allows you to wrap a **server function** so that it can access the time context.
 * @param fn - The function to wrap.
 * @returns The wrapped function.
 */
export const withTimeContextFunction = <Args extends any[], Output>(
  fn: (...args: Args) => Promise<Output>,
  context: TimeContext = defaultTimeContext()
) => {
  // TEST#3
  return async (...args: Args): Promise<Output> => {
    return runWithContext(context, () => fn(...args));
  };
};
