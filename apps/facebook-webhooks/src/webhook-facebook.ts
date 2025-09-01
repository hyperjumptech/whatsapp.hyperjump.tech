import { saveWebhookLog } from "./webhook-log.js";
import {
  validateSignature,
  validateWebhookFromAppPhoneId,
} from "./webhook-payload-validation.js";
import { ContentfulStatusCode } from "hono/utils/http-status";

/**
 * This is the main function that handles the webhook request.
 *
 * IMPORTANT: The function needs to be called within a context that provides a prisma client (dbContext).
 *
 * @param headerSignature - The header signature.
 * @param bodyBuffer - The body buffer.
 * @returns The result of the webhook request.
 */
export const webhookFacebook = async ({
  headers,
  body,
}: {
  headers: Headers;
  body: object;
}): Promise<{ error?: string; status: ContentfulStatusCode }> => {
  // In the original code, the header signature is in the x-hub-signature header. But reading the documentation, it seems that the header signature is in the x-hub-signature-256 header.
  const headerSignature =
    headers.get("x-hub-signature-256") ?? headers.get("x-hub-signature") ?? "";
  if (!headerSignature) {
    // TEST#1
    return {
      error: "No X-Hub-Signature or X-Hub-Signature-256 headers provided",
      status: 403,
    };
  }

  if (!body) {
    // TEST#2
    return { error: "No body provided", status: 403 };
  }

  const isValidPayloadPhoneId = validateWebhookFromAppPhoneId(body);

  if (!isValidPayloadPhoneId) {
    // We are not interested in the webhook if the phone_number_id is not the same as the app phone id. There's a bug in the WhatsApp API where they send all webhooks from all phone numbers instead of only the one we are interested in.
    // We don't return an error because we don't want to block the webhook. According to the documentation, "Your endpoint should respond to all Event Notifications with 200 OK HTTPS."
    // TEST#3
    return { status: 200 };
  }

  const bodyString = JSON.stringify(body);

  const shaType = headerSignature?.split("=").at(0);
  if (!shaType || !shaType.startsWith("sha")) {
    // TEST#4
    return { error: "No SHA type provided", status: 403 };
  }

  const isValid = validateSignature(shaType, headerSignature, bodyString);

  if (!isValid) {
    // TEST#5
    return { error: "Signature does not match", status: 403 };
  }

  // TEST#6
  await saveWebhookLog(bodyString);

  return { status: 200 };
};
