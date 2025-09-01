import { env } from "@workspace/env";
import { createHmac } from "crypto";
import { z } from "zod";

export const validateSignature = (
  shaType: string,
  signature: string,
  payload: string
) => {
  const hmac = createHmac(shaType, env.FACEBOOK_WEBHOOK_APP_SECRET);
  hmac.update(payload);
  const expectedSignature = `${shaType}=${hmac.digest("hex")}`;

  // TEST#2
  return expectedSignature === signature;
};

export const validateWebhookFromAppPhoneId = (payload: object) => {
  const parsedPayload = webhookPayloadSchema.safeParse(payload);

  // TEST#3
  return parsedPayload.success;
};

// Minimum Zod schema to validate phone_number_id equals WHATSAPP_API_PHONE_ID
// TEST#1
export const webhookPayloadSchema = z.object({
  entry: z.array(
    z.object({
      changes: z.array(
        z.object({
          value: z.object({
            metadata: z.object({
              phone_number_id: z.literal(env.WHATSAPP_API_PHONE_ID),
            }),
          }),
        })
      ),
    })
  ),
});
