import "@testing-library/jest-dom";
import { v4 as uuidv4 } from "uuid";
import { describe, expect, it, vi } from "vitest";
import {
  getRandomContext,
  runWithContext,
  runWithDefaultContext,
  withRandomContext,
  withRandomContextAction,
  withRandomContextFunction,
} from "./random-context.js";
import { renderServerComponent } from "./test-async-rsc.js";

describe("random-context", () => {
  it("TEST#1: should throw an error if the random context is not initialized", () => {
    expect(() => getRandomContext()).toThrow();
  });

  it("TEST#2: should be able to get the random context", () => {
    const expectedUuid = "123";

    const returnedUuid = runWithContext(
      {
        uuid: () => expectedUuid,
      },
      () => {
        const randomContext = getRandomContext();
        return randomContext.uuid();
      }
    );

    expect(returnedUuid).toEqual(expectedUuid);
  });

  it("TEST#3: should be able to wrap a function with the random context", async () => {
    const expectedUuid = "123";

    const testFunction = async (name: string): Promise<string> => {
      const randomContext = getRandomContext();
      return `${name} - ${randomContext.uuid()}`;
    };
    const wrappedFunction = withRandomContextFunction(testFunction, {
      uuid: () => expectedUuid,
    });

    const returnedUuid = await wrappedFunction("John Doe");

    expect(returnedUuid).toEqual(`John Doe - ${expectedUuid}`);
  });

  it("TEST#4: should be able to wrap a form action with the time context", async () => {
    const expectedUuid = "123";

    const testFunction = async (_prevState: string, formData: FormData) => {
      const randomContext = getRandomContext();
      const name = formData.get("name");
      return `${name} - ${randomContext.uuid()}`;
    };

    const wrappedFunction = withRandomContextAction(testFunction, {
      uuid: () => expectedUuid,
    });

    expect(wrappedFunction).toBeDefined();

    const formData = new FormData();
    formData.append("name", "John Doe");
    const returnedUuid = await wrappedFunction("", formData);

    expect(returnedUuid).toEqual(`John Doe - ${expectedUuid}`);
  });

  it("TEST#5: should be able to wrap a server component with the random context", async () => {
    const expectedUuid = "123";
    const TestComponent = async ({ name }: { name: string }) => {
      const randomContext = getRandomContext();
      return (
        <div>
          {name} - {randomContext.uuid()}
        </div>
      );
    };

    const WrappedComponent = withRandomContext(TestComponent, {
      uuid: () => expectedUuid,
    });

    const { getByText } = await renderServerComponent(
      <WrappedComponent name="John Doe" />
    );

    expect(getByText(`John Doe - ${expectedUuid}`)).toBeInTheDocument();
  });

  it("TEST#6: should be able to run a function with the default time context", () => {
    const returnedUuid = runWithDefaultContext(() => {
      const randomContext = getRandomContext();
      return randomContext.uuid();
    });

    expect(returnedUuid).toBeDefined();
    expect(returnedUuid.length).toEqual(36);

    for (let i = 0; i < 100; i++) {
      const randomId = uuidv4();
      expect(returnedUuid).not.toEqual(randomId);
    }
  });
});
