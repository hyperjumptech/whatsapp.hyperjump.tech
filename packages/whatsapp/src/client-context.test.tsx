import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getWhatsappClientContext,
  runWithDefaultContext,
  runWithContext,
  withWhatsappClientAction,
  withWhatsappClientFunction,
} from "./client-context.js";
import { WhatsappClient } from "./client.js";

const mockedSend = vi.fn();
vi.mock("./client", () => ({
  WhatsappClient: vi.fn().mockImplementation(() => ({
    send: mockedSend,
  })),
}));

describe("whatsapp-client-context", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });
  afterEach(async () => {
    vi.clearAllMocks();
  });

  it("TEST#1: should throw an error if the whatsapp client context is not initialized", () => {
    expect(() => getWhatsappClientContext()).toThrow();
  });

  it("TEST#2: should be able to get the whatsapp client context", async () => {
    const whatsappClient = new WhatsappClient();

    await runWithContext(
      {
        whatsappClient,
      },
      () => {
        const { whatsappClient } = getWhatsappClientContext();
        return whatsappClient.send("Hello", ["a"], "b");
      }
    );

    expect(whatsappClient.send).toHaveBeenCalledWith("Hello", ["a"], "b");
  });

  it("TEST#3: should be able to wrap a function with the whatsapp client context", async () => {
    const whatsappClient = new WhatsappClient();

    const testFunction = async (name: string): Promise<void> => {
      const { whatsappClient } = getWhatsappClientContext();
      whatsappClient.send("Hello", ["a"], "b");
    };
    const wrappedFunction = withWhatsappClientFunction(
      testFunction,
      whatsappClient
    );

    await wrappedFunction("John Doe");

    expect(whatsappClient.send).toHaveBeenCalledWith("Hello", ["a"], "b");
  });

  it("TEST#4: should be able to wrap a form action with the whatsapp client context", async () => {
    const whatsappClient = new WhatsappClient();

    const testFunction = async (
      _prevState: string | null,
      formData: FormData
    ) => {
      const { whatsappClient } = getWhatsappClientContext();
      const name = formData.get("name");
      whatsappClient.send("Hello", ["a"], "b");
      return name as string | null;
    };

    const wrappedFunction = withWhatsappClientAction(
      testFunction,
      whatsappClient
    );

    const formData = new FormData();
    formData.append("name", "John Doe");
    const result = await wrappedFunction("", formData);

    expect(result).toBe("John Doe");
    expect(whatsappClient.send).toHaveBeenCalledWith("Hello", ["a"], "b");
  });

  it("TEST#5: should be able to run a function with the default whatsapp client context", async () => {
    await runWithDefaultContext(() => {
      const { whatsappClient } = getWhatsappClientContext();
      return whatsappClient.send("Hello", ["a"], "b");
    });

    expect(mockedSend).toHaveBeenCalledWith("Hello", ["a"], "b");
  });
});
