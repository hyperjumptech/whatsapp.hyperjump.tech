import { describe, expect, it, vi } from "vitest";
import { getWhatsappClientContext, withWhatsappClient } from "./whatsapp.js";
import { WhatsappClient } from "@workspace/whatsapp/client";
import { renderServerComponent } from "@workspace/utils/test-async-rsc";
import { act } from "@testing-library/react";

vi.mock("@workspace/env", () => ({
  env: {
    WHATSAPP_API_PHONE_ID: "1234567890",
  },
}));

vi.mock("@workspace/whatsapp/client", () => ({
  WhatsappClient: vi.fn().mockImplementation(() => ({
    send: vi.fn(),
  })),
}));

describe("withWhatsappClient", () => {
  it("should wrap the component with the whatsapp client", async () => {
    const whatsappClientMocked = vi.mocked(WhatsappClient);
    const waClient = new whatsappClientMocked();

    const MainComponent = async () => {
      const { whatsappClient } = getWhatsappClientContext();
      return (
        <button
          onClick={async () => {
            await whatsappClient.send("template", ["Hello"], "1234567890");
          }}>
          Hello
        </button>
      );
    };

    const Component = withWhatsappClient(MainComponent, waClient);
    expect(Component).toBeDefined();

    const { getByText } = await renderServerComponent(<Component />);

    const button = getByText("Hello");
    await act(async () => button.click());

    expect(waClient.send).toHaveBeenCalledWith(
      "template",
      ["Hello"],
      "1234567890"
    );
  });
});
