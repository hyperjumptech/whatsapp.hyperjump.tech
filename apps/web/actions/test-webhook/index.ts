import { redirect } from "next/navigation";
import { z } from "zod";
import { actionTemplate } from "@workspace/whatsapp/action-template";
import { functionCreator } from "@/lib/context/helper";
import { getUserByPhoneHash } from "@/lib/repositories/user";
import { getWebhookByToken } from "@/lib/repositories/webhook-token";
import { getTimeContext } from "@workspace/utils/time-context";
import {
  sendIncidentRecoveryMessage,
  sendStartTerminateMessage,
  sendStatusUpdateMessage,
} from "@workspace/whatsapp/send-message";

export const errorCodes = {
  INVALID_DATA: "INVALID_DATA",
  WEBHOOK_NOT_FOUND: "WEBHOOK_NOT_FOUND",
  USER_NOT_FOUND: "USER_NOT_FOUND",
} as const;

/**
 * This schema is used to validate the data passed to the testWebhook function.
 */
const testWebhookSchema = z.object({
  type: z.enum(Object.keys(actionTemplate) as [keyof typeof actionTemplate]),
  token: z.string().min(1),
});

/**
 * This function is used to test the webhook. When successful, it will immediately redirect to the success page.
 *
 * IMPORTANT: The function needs to be called within a context that provides a prisma client (dbContext).
 *
 * @param data - The data to test the webhook for.
 * @returns The error code if the data is invalid.
 */
export const testWebhook = async (data: {
  type: keyof typeof actionTemplate;
  token: string;
}): Promise<
  | undefined
  | {
      error: string;
    }
> => {
  const parseResult = testWebhookSchema.safeParse(data);

  if (!parseResult.success) {
    // TEST#1
    return {
      error: errorCodes.INVALID_DATA,
    };
  }

  const webhook = await getWebhookByToken(parseResult.data.token);

  if (!webhook) {
    // TEST#2
    return {
      error: errorCodes.WEBHOOK_NOT_FOUND,
    };
  }

  const user = await getUserByPhoneHash(webhook.user);

  if (!user) {
    // TEST#3
    return {
      error: errorCodes.USER_NOT_FOUND,
    };
  }

  // create test data
  const { now } = getTimeContext();
  const phone = user.phoneHash;
  const time = now().toUTCString();
  const probe_url = "http://www.example.com";
  const ip_address = "127.0.0.1";
  const host =
    "127.0.0.1 (local), 129.111.33.135 (public) My-Computer.local (hostname)";

  switch (parseResult.data.type) {
    case "start": // TEST#4.1
    case "terminate": // TEST#4.2
      await sendStartTerminateMessage({
        phone,
        type: parseResult.data.type,
        ipAddress: ip_address,
      });
      break;
    case "incident": // TEST#5.1
    case "recovery": // TEST#5.2
      const alert =
        parseResult.data.type === "incident"
          ? "Status is 400, was expecting 200."
          : "Service is ok. Status now 200";
      await sendIncidentRecoveryMessage({
        phone,
        type: parseResult.data.type,
        alert,
        url: probe_url,
        time,
        monika: host,
      });
      break;
    case "status-update":
      // TEST#6
      await sendStatusUpdateMessage({
        phone,
        type: parseResult.data.type,
        time,
        monika: host,
        numberOfProbes: "10",
        averageResponseTime: "100ms",
        numberOfIncidents: "1",
        numberOfRecoveries: "1",
        numberOfSentNotifications: "1",
      });
      break;
  }

  // TEST#7
  redirect("/test-webhook/success");
};

/**
 * This function returns **a testWebhook action CREATOR**. IT DOES NOT CREATE THE SERVER ACTION OR SERVER FUNCTION ITSELF.
 *
 * Using the creator, you can create a server action or server function that can be called from the client.
 *
 * The default (production) server action is in the /actions/test-webhook/action.ts file.
 *
 * For testing, you can create a server function that uses its own prisma, whatsapp client, etc.
 *
 * @example
 * ```ts
 * export const testWebhook = testWebhookActionCreator();
 * ```
 *
 * The exported testWebhook above is a server function that can be called from the client component.
 */
export const testWebhookActionCreator = functionCreator(testWebhook);
