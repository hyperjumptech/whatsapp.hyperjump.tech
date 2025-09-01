import { describe, it, expect, vi, afterEach } from "vitest";
import {
  validateSignature,
  validateWebhookFromAppPhoneId,
  webhookPayloadSchema,
} from "./webhook-payload-validation.js";
import { createHmac } from "crypto";

vi.mock("@workspace/env", () => ({
  env: {
    WHATSAPP_API_PHONE_ID: "1234",
  },
}));
vi.mock("crypto", () => ({
  createHmac: vi.fn().mockReturnValue({
    update: vi.fn(),
    digest: vi.fn().mockReturnValue("mock-digest"),
  }),
}));

describe("webhook-payload-validation", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("TEST#1: should return failed validation for the payload with invalid structure", () => {
    const payload = {
      entry: [
        {
          id: "1234",
        },
      ],
    };

    const result = webhookPayloadSchema.safeParse(payload);

    expect(result.success).toBe(false);
  });

  it("TEST#1: should return failed validation for the payload with invalid phone_number_id", () => {
    const payload = {
      entry: [
        {
          id: "1234",
          changes: [
            {
              field: "messages",
              value: {
                metadata: {
                  phone_number_id: "5678",
                  display_phone_number: "1234",
                },
                statuses: [],
                messaging_product: "whatsapp",
              },
            },
          ],
          object: "whatsapp_business_account",
        },
      ],
    };

    const result = webhookPayloadSchema.safeParse(payload);

    expect(result.success).toBe(false);
  });

  it("TEST#1: should return succes validation for the payload with valid phone_number_id", () => {
    const payload = {
      entry: [
        {
          id: "1234",
          changes: [
            {
              field: "messages",
              value: {
                metadata: {
                  phone_number_id: "1234",
                  display_phone_number: "1234",
                },
                statuses: [],
                messaging_product: "whatsapp",
              },
            },
          ],
          object: "whatsapp_business_account",
        },
      ],
    };

    const result = webhookPayloadSchema.safeParse(payload);

    expect(result.success).toBe(true);
  });

  it("TEST#2: should return failed validation for the payload with invalid signature", () => {
    vi.mocked(createHmac).mockReturnValue({
      update: vi.fn(),
      digest: vi.fn().mockReturnValue("invalid-digest"),
    } as any);

    const result = validateSignature(
      "sha256",
      "invalid-signature",
      "valid-payload"
    );

    expect(result).toBe(false);
  });

  it("TEST#2: should return successful validation for the payload with valid signature", () => {
    vi.mocked(createHmac).mockReturnValue({
      update: vi.fn(),
      digest: vi.fn().mockReturnValue("valid-digest"),
    } as any);

    const result = validateSignature(
      "sha256",
      "sha256=valid-digest",
      "valid-payload"
    );

    expect(result).toBe(true);
  });

  it("TEST#3: should return failed validation for the payload with invalid structure", () => {
    const payload = {
      entry: [
        {
          id: "1234",
        },
      ],
    };

    const result = validateWebhookFromAppPhoneId(payload);

    expect(result).toBe(false);

    const correctPayload = {
      entry: [
        {
          id: "1234",
          changes: [
            {
              field: "messages",
              value: {
                metadata: {
                  phone_number_id: "1234",
                  display_phone_number: "1234",
                },
                statuses: [],
                messaging_product: "whatsapp",
              },
            },
          ],
          object: "whatsapp_business_account",
        },
      ],
    };

    const result2 = validateWebhookFromAppPhoneId(correctPayload);

    expect(result2).toBe(true);
  });
});
