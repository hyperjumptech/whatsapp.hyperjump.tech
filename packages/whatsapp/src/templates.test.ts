import { describe, it, expect, vi } from "vitest";
import { sendMessageTemplate } from "./templates.js";
import { WhatsappClient } from "./client.js";
import { runWithContext } from "./client-context.js";
import { errorCodes } from "./templates.js";

vi.mock("./client", () => {
  return {
    WhatsappClient: vi.fn().mockImplementation(() => {
      return {
        send: vi.fn().mockReturnValue({
          error: null,
          data: { messages: [{ id: "test-id" }] },
        }),
      };
    }),
  };
});

describe("sendMessageTemplate", () => {
  it("TEST#1: should return template not found error", async () => {
    const result = await sendMessageTemplate({
      phone: "test4",
      // @ts-expect-error - This is a test
      type: "unknown",
      input: { name: "test", activationLink: "test2", expiredAt: "test3" },
    });
    expect(result.error).toBe(errorCodes.WHATSAPP_TEMPLATE_NOT_FOUND);
  });

  it("TEST#2: should call whatsappClient.send with the correct arguments", async () => {
    // setup
    const whatsappClientMock = new WhatsappClient();

    // execute within the context of the mock whatsappClient
    const result = await runWithContext(
      {
        whatsappClient: whatsappClientMock,
      },
      async () => {
        return await sendMessageTemplate({
          phone: "test4",
          type: "confirmation",
          input: {
            name: "test",
            activationLink: "test2",
            expiredAt: "test3",
          },
        });
      }
    );

    // expectations
    expect(whatsappClientMock.send).toHaveBeenCalledWith(
      "confirmation",
      ["test", "test2", "test3"],
      "test4"
    );
    expect(result.error).toBe(null);
    expect(result.data).toEqual({ messages: [{ id: "test-id" }] });
  });

  it("TEST#3: should return error from the whatsapp client", async () => {
    const whatsappClientMock = new WhatsappClient();
    whatsappClientMock.send = vi.fn().mockReturnValue({
      error: "some-error",
      data: null,
    });

    const result = await runWithContext(
      {
        whatsappClient: whatsappClientMock,
      },
      async () => {
        return await sendMessageTemplate({
          phone: "test4",
          type: "confirmation",
          input: { name: "test", activationLink: "test2", expiredAt: "test3" },
        });
      }
    );

    expect(result.error).toBe("some-error");
  });

  it("TEST#4: should return error if the whatsapp client returns no data", async () => {
    const whatsappClientMock = new WhatsappClient();
    whatsappClientMock.send = vi.fn().mockReturnValue({
      error: null,
      data: null,
    });

    const result = await runWithContext(
      {
        whatsappClient: whatsappClientMock,
      },
      async () => {
        return await sendMessageTemplate({
          phone: "test4",
          type: "confirmation",
          input: { name: "test", activationLink: "test2", expiredAt: "test3" },
        });
      }
    );

    expect(result.error).toBe(errorCodes.WHATSAPP_SEND_MESSAGE_ERROR);
  });

  it("TEST#5: should return the data from the whatsapp client", async () => {
    const whatsappClientMock = new WhatsappClient();
    whatsappClientMock.send = vi.fn().mockReturnValue({
      error: null,
      data: { messages: [{ id: "test-id" }] },
    });

    const result = await runWithContext(
      {
        whatsappClient: whatsappClientMock,
      },
      async () => {
        return await sendMessageTemplate({
          phone: "test4",
          type: "confirmation",
          input: { name: "test", activationLink: "test2", expiredAt: "test3" },
        });
      }
    );

    expect(result.data).toEqual({ messages: [{ id: "test-id" }] });
    expect(result.error).toBe(null);
  });
});
