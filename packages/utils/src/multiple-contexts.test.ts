import { describe, expect, it, vi } from "vitest";
import {
  ContextBuilder,
  runWithMultipleContexts,
  withMultipleContextFormAction,
  withMultipleContextFunction,
} from "./multiple-contexts.js";
import {
  defaultRandomContext,
  getRandomContext,
  randomContextStorage,
} from "./random-context.js";
import {
  defaultTimeContext,
  getTimeContext,
  timeContextStorage,
} from "./time-context.js";

describe("multiple-contexts", () => {
  it("TEST#1: should be able to build a context builder", () => {
    const contextBuilder = new ContextBuilder();
    expect(contextBuilder).toBeDefined();

    contextBuilder.addContext(randomContextStorage, defaultRandomContext);
    contextBuilder.addContext(timeContextStorage, defaultTimeContext);

    const contexts = contextBuilder.build();
    expect(contexts).toBeDefined();
    expect(contexts.length).toEqual(2);
    expect(contexts![0]![0]).toBeDefined();
    expect(contexts![0]![1]).toBeDefined();
    expect(contexts![1]![0]).toBeDefined();
    expect(contexts![1]![1]).toBeDefined();
    expect(contexts![0]![0]).toEqual(randomContextStorage);
    expect(contexts![0]![1]).toEqual(defaultRandomContext);
    expect(contexts![1]![0]).toEqual(timeContextStorage);
    expect(contexts![1]![1]).toEqual(defaultTimeContext);
  });

  it("TEST#2: should be able to run a function with multiple contexts", async () => {
    const contextBuilder = new ContextBuilder();
    contextBuilder.addContext(randomContextStorage, () => {
      return {
        uuid: () => "123",
      };
    });
    contextBuilder.addContext(timeContextStorage, () => {
      return {
        now: () => new Date("2025-01-01"),
      };
    });

    const result = await runWithMultipleContexts(contextBuilder, async () => {
      const randomContext = getRandomContext();
      const timeContext = getTimeContext();
      return {
        randomContext,
        timeContext,
      };
    });
    expect(result).toBeDefined();
    expect(result.randomContext).toBeDefined();
    expect(result.randomContext.uuid()).toEqual("123");
    expect(result.timeContext).toBeDefined();
    expect(result.timeContext.now()).toEqual(new Date("2025-01-01"));
  });

  it("TEST#3: should be able to wrap a form action with multiple contexts", async () => {
    const contextBuilder = new ContextBuilder();
    contextBuilder.addContext(randomContextStorage, () => {
      return {
        uuid: () => "123",
      };
    });
    contextBuilder.addContext(timeContextStorage, () => {
      return {
        now: () => new Date("2025-01-01"),
      };
    });

    const wrappedFormAction = withMultipleContextFormAction(
      contextBuilder,
      async (
        _prevState: any | null,
        formData: FormData
      ): Promise<{
        random: string;
        time: Date;
        name: string;
      } | null> => {
        const randomContext = getRandomContext();
        const timeContext = getTimeContext();
        const name = formData.get("name");
        return {
          random: randomContext.uuid(),
          time: timeContext.now(),
          name: name as string,
        };
      }
    );
    expect(wrappedFormAction).toBeDefined();
    const formData = new FormData();
    formData.append("name", "John Doe");
    const result = await wrappedFormAction(null, formData);
    expect(result).toBeDefined();
    expect(result!.name).toEqual("John Doe");
    expect(result!.random).toEqual("123");
    expect(result!.time).toEqual(new Date("2025-01-01"));
  });

  it("TEST#4: should be able to wrap a function with multiple contexts", async () => {
    const contextBuilder = new ContextBuilder();
    contextBuilder.addContext(randomContextStorage, () => {
      return {
        uuid: () => "123",
      };
    });
    contextBuilder.addContext(timeContextStorage, () => {
      return {
        now: () => new Date("2025-01-01"),
      };
    });

    const wrappedFunction = withMultipleContextFunction(
      contextBuilder,
      async (
        name: string
      ): Promise<{
        random: string;
        time: Date;
        name: string;
      }> => {
        const randomContext = getRandomContext();
        const timeContext = getTimeContext();
        return {
          random: randomContext.uuid(),
          time: timeContext.now(),
          name,
        };
      }
    );
    expect(wrappedFunction).toBeDefined();
    const result = await wrappedFunction("John Doe");
    expect(result).toBeDefined();
    expect(result.name).toEqual("John Doe");
    expect(result.random).toEqual("123");
    expect(result.time).toEqual(new Date("2025-01-01"));
  });
});
