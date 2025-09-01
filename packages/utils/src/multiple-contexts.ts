import { AsyncLocalStorage } from "async_hooks";

/**
 * This class is used to build a context builder. This is needed to make sure that the correct pair of storage and default context is used.
 */
export class ContextBuilder {
  private contexts: Array<[AsyncLocalStorage<any>, () => any]> = [];

  /**
   * This method adds a context to the builder.
   * @param storage - The storage to use.
   * @param defaultContext - The default context of the storage to use.
   * @returns The builder instance.
   */
  addContext<T>(storage: AsyncLocalStorage<T>, defaultContext: () => T): this {
    this.contexts.push([storage, defaultContext]);
    return this;
  }

  /**
   * This method builds the context builder.
   * @returns The context builder.
   */
  build() {
    // TEST#1
    return this.contexts;
  }
}

/**
 * This function runs a function with multiple contexts.
 * @param contexts - The context builder to run the function with.
 * @param mainFunc - The function to run.
 * @param index - The index of the context to run.
 * @returns The result of the function.
 */
export const runWithMultipleContexts = async <T>(
  contexts: ContextBuilder,
  mainFunc: () => Promise<T>,
  index: number = 0
): Promise<T> => {
  const contextsArray = contexts.build();
  if (index >= contextsArray.length) {
    return mainFunc();
  }
  const [storage, store] = contextsArray[index]!;
  // TEST#2
  return storage.run(store(), () =>
    runWithMultipleContexts(contexts, mainFunc, index + 1)
  );
};

/**
 * This function wraps a form action with multiple contexts.
 * @param contexts - The context builder to wrap the function with.
 * @param mainFunc - The function to wrap.
 * @returns The wrapped function.
 */
export const withMultipleContextFormAction = <T>(
  contexts: ContextBuilder,
  mainFunc: (prevState: T, formData: FormData) => Promise<T>
) => {
  // TEST#3
  return (prevState: T, formData: FormData) =>
    runWithMultipleContexts(contexts, () => mainFunc(prevState, formData), 0);
};

/**
 * This function wraps a function with multiple contexts.
 * @param contexts - The context builder to wrap the function with.
 * @param mainFunc - The function to wrap.
 * @returns The wrapped function.
 */
export const withMultipleContextFunction = <Args extends any[], Output>(
  contexts: ContextBuilder,
  mainFunc: (...args: Args) => Promise<Output>
) => {
  // TEST#4
  return (...args: Args) =>
    runWithMultipleContexts(contexts, () => mainFunc(...args), 0);
};
