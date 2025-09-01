import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { webhookFacebook } from "./webhook-facebook.js";
import {
  validateSignature,
  validateWebhookFromAppPhoneId,
} from "./webhook-payload-validation.js";
import { runWithContext } from "@workspace/database/context";
import { TestDatabase } from "@workspace/database/test-utils";

vi.mock("./webhook-payload-validation.js", () => ({
  validateWebhookFromAppPhoneId: vi.fn().mockReturnValue(false),
  validateSignature: vi.fn().mockReturnValue(false),
}));

describe("webhook-facebook", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("TEST#1: should return failed validation for the payload with invalid signature", async () => {
    const result = await webhookFacebook({
      headers: new Headers({
        whatever: "sha256=invalid-signature",
      }),
      body: {},
    });

    expect(result).toEqual({
      error: "No X-Hub-Signature or X-Hub-Signature-256 headers provided",
      status: 403,
    });
  });

  it("TEST#2: should return failed validation for the payload with invalid body", async () => {
    const result = await webhookFacebook({
      headers: new Headers({
        "x-hub-signature-256": "sha256=invalid-signature",
      }),
      // @ts-expect-error - we want to test the case where the body is null
      body: null,
    });

    expect(result).toEqual({
      error: "No body provided",
      status: 403,
    });
  });

  it("TEST#3: should return failed validation for the payload with invalid phone_number_id", async () => {
    const result = await webhookFacebook({
      headers: new Headers({
        "x-hub-signature-256": "sha256=invalid-signature",
      }),
      body: {},
    });

    expect(result).toEqual({
      status: 200,
    });
    expect(validateSignature).not.toHaveBeenCalled();
  });

  it("TEST#4: should return failed validation for the payload with invalid sha type", async () => {
    // setup
    vi.mocked(validateWebhookFromAppPhoneId).mockReturnValue(true);

    const result = await webhookFacebook({
      headers: new Headers({
        "x-hub-signature-256": "invalid-signature",
      }),
      body: {},
    });

    expect(result).toEqual({
      error: "No SHA type provided",
      status: 403,
    });
  });

  it("TEST#5: should return failed validation for the payload with invalid signature", async () => {
    // setup
    vi.mocked(validateWebhookFromAppPhoneId).mockReturnValue(true);
    vi.mocked(validateSignature).mockReturnValue(false);

    const result = await webhookFacebook({
      headers: new Headers({
        "x-hub-signature-256": "sha256=invalid-signature",
      }),
      body: {},
    });

    expect(result).toEqual({
      error: "Signature does not match",
      status: 403,
    });
  });
});

describe("webhook-facebook - success", () => {
  let testDb: TestDatabase;
  beforeEach(async () => {
    testDb = new TestDatabase();
    await testDb.setup();
  });

  afterEach(async () => {
    vi.clearAllMocks();
    await testDb.cleanup();
  });

  it("TEST#6: should return success validation for the payload with valid signature", async () => {
    // setup
    vi.mocked(validateWebhookFromAppPhoneId).mockReturnValue(true);
    vi.mocked(validateSignature).mockReturnValue(true);

    const result = await runWithContext(
      {
        prisma: testDb.getPrismaClient(),
      },
      async () => {
        return webhookFacebook({
          headers: new Headers({
            "x-hub-signature-256": "sha256=invalid-signature",
          }),
          body: {
            something: "something",
          },
        });
      }
    );

    expect(result).toEqual({
      status: 200,
    });

    const webhookLog = await testDb.getPrismaClient().webhook_logs.findFirst({
      where: {
        logs: {
          path: ["something"],
          equals: "something",
        },
      },
    });

    expect(webhookLog).toBeDefined();
  });
});
