/*
This file contains the main logic for the resend action.

To use the resend action in the client component, you need to import the `resend` function from the `action.ts` file.
*/

import { functionCreator } from "@/lib/context/helper";
import { redirect } from "next/navigation";
import { z } from "zod";
import { sendInstructionMessage } from "@workspace/whatsapp/send-message";
import {
  getWebhookByUser,
  updateWebhookResendAt,
} from "@/lib/repositories/webhook-token";

/**
 * This object contains the error codes that can be returned by the resend function.
 */
export const errorCodes = {
  INVALID_DATA: "INVALID_DATA",
  WEBHOOK_NOT_FOUND: "WEBHOOK_NOT_FOUND",
  WEBHOOK_RESEND_TOO_SOON: "WEBHOOK_RESEND_TOO_SOON",
} as const;

/**
 * This schema is used to validate the data passed to the resend function.
 */
const resendSchema = z.object({
  name: z.string().min(3),
  phone: z.string().min(10),
});
/**
 * This function resends a confirmation message to a user. When successful, it will immediately redirect to the confirmed page.
 *
 * IMPORTANT: The function needs to be called within a context that provides a prisma client (dbContext).
 *
 * @param data - The data to resend the confirmation message for.
 * @returns The error code if the data is invalid.
 */
const resend = async (data: {
  name: string;
  phone: string;
}): Promise<
  | undefined
  | {
      error: string;
    }
> => {
  const parseResult = resendSchema.safeParse(data);

  // TEST#1
  if (!parseResult.success) {
    return {
      error: errorCodes.INVALID_DATA,
    };
  }

  const webhook = await getWebhookByUser(parseResult.data.phone);

  if (!webhook) {
    // TEST#2
    return {
      error: errorCodes.WEBHOOK_NOT_FOUND,
    };
  }

  if (webhook.resendAt && webhook.resendAt >= new Date()) {
    // TEST#3
    return {
      error: errorCodes.WEBHOOK_RESEND_TOO_SOON,
    };
  }

  // TEST#4
  await sendInstructionMessage({
    phone: webhook.user,
    webhookToken: webhook.token,
  });

  // TEST#5
  await updateWebhookResendAt(webhook.token);

  // TEST#6
  redirect("/confirmed");
};

/**
 * This function returns **a resend action CREATOR**. IT DOES NOT CREATE THE SERVER ACTION OR SERVER FUNCTION ITSELF.
 *
 * Using the creator, you can create a server action or server function that can be called from the client.
 *
 * The default (production) server action is in the /actions/resend/action.ts file.
 *
 * For testing, you can create a server function that uses its own prisma, whatsapp client, etc.
 *
 * @example
 * ```ts
 * export const resend = resendActionCreator();
 * ```
 *
 * The exported resend above is a server function that can be called from the client component.
 */
export const resendActionCreator = functionCreator(resend);
