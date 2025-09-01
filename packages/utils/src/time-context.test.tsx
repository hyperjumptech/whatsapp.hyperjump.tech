import "@testing-library/jest-dom";
import { describe, expect, it, vi } from "vitest";
import {
  getTimeContext,
  runWithContext,
  runWithDefaultContext,
  withTimeContext,
  withTimeContextAction,
  withTimeContextFunction,
} from "./time-context.js";
import { renderServerComponent } from "./test-async-rsc.js";

describe("time-context", () => {
  it("TEST#1: should throw an error if the time context is not initialized", () => {
    expect(() => getTimeContext()).toThrow();
  });

  it("TEST#2: should be able to get the time context", () => {
    const expectedTime = new Date();

    const returnedTime = runWithContext(
      {
        now: () => expectedTime,
      },
      () => {
        const timeContext = getTimeContext();
        return timeContext.now();
      }
    );

    expect(returnedTime).toEqual(expectedTime);
  });

  it("TEST#3: should be able to wrap a function with the time context", async () => {
    const expectedTime = new Date("2025-01-01");

    const testFunction = async (name: string): Promise<string> => {
      const timeContext = getTimeContext();
      return `${name} - ${timeContext.now().getTime()}`;
    };
    const wrappedFunction = withTimeContextFunction(testFunction, {
      now: () => expectedTime,
    });

    const returnedTime = await wrappedFunction("John Doe");

    expect(returnedTime).toEqual(`John Doe - ${expectedTime.getTime()}`);
  });

  it("TEST#4: should be able to wrap a form action with the time context", async () => {
    const expectedTime = new Date("2025-01-01");

    const testFunction = async (_prevState: string, formData: FormData) => {
      const timeContext = getTimeContext();
      const name = formData.get("name");
      return `${name} - ${timeContext.now().getTime()}`;
    };

    const wrappedFunction = withTimeContextAction(testFunction, {
      now: () => expectedTime,
    });

    expect(wrappedFunction).toBeDefined();

    const formData = new FormData();
    formData.append("name", "John Doe");
    const returnedTime = await wrappedFunction("", formData);

    expect(returnedTime).toEqual(`John Doe - ${expectedTime.getTime()}`);
  });

  it("TEST#5: should be able to wrap a server component with the time context", async () => {
    const expectedTime = new Date("2025-01-01");
    const TestComponent = async ({ name }: { name: string }) => {
      const timeContext = getTimeContext();
      return (
        <div>
          {name} - {timeContext.now().getTime()}
        </div>
      );
    };

    const WrappedComponent = withTimeContext(TestComponent, {
      now: () => expectedTime,
    });

    const { getByText } = await renderServerComponent(
      <WrappedComponent name="John Doe" />
    );

    expect(
      getByText(`John Doe - ${expectedTime.getTime()}`)
    ).toBeInTheDocument();
  });

  it("TEST#6: should be able to run a function with the default time context", () => {
    const startTime = new Date();
    const returnedTime = runWithDefaultContext(() => {
      const timeContext = getTimeContext();
      return timeContext.now();
    });

    expect(returnedTime).toBeInstanceOf(Date);
    expect(returnedTime.getTime()).toBeGreaterThanOrEqual(startTime.getTime());
  });
});
