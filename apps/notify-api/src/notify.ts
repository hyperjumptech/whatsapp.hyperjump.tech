import {
  sendIncidentRecoveryMessage,
  sendStartTerminateMessage,
  sendStatusUpdateMessage,
} from "@workspace/whatsapp/send-message";
import { getWebhookByToken } from "./webhook-token.js";
import { getUserByPhoneHash } from "./user.js";
import { notifyQuerySchema, notifyBodySchema } from "./validation.js";
import { ContentfulStatusCode } from "hono/utils/http-status";

/**
 * This is the object for the errors.
 */
const errors = {
  TOKEN_NOT_FOUND: "TOKEN_NOT_FOUND",
  INVALID_TOKEN: "INVALID_TOKEN",
  INVALID_REQUEST_BODY: "INVALID_REQUEST_BODY",
  INVALID_ACTION_TYPE: "INVALID_ACTION_TYPE",
  USER_NOT_FOUND: "USER_NOT_FOUND",
};

/**
 * This is the main function that handles the notify request.
 *
 * IMPORTANT: The function needs to be called within a context that provides a prisma client (dbContext).
 *
 * @param query - The request query.
 * @param body - The request body.
 * @returns The result of the notify request.
 */
export const notify = async ({
  query,
  body,
}: {
  query: Record<string, string>;
  body: object;
}): Promise<{
  error?: string;
  message?: string;
  status: ContentfulStatusCode;
}> => {
  const queryParseResult = notifyQuerySchema.safeParse(query);

  if (!queryParseResult.success) {
    // TEST#1
    return { error: errors.TOKEN_NOT_FOUND, status: 401 };
  }

  const { token } = queryParseResult.data;

  const bodyParseResult = notifyBodySchema.safeParse(body);

  if (!bodyParseResult.success) {
    // TEST#2
    return { error: errors.INVALID_REQUEST_BODY, status: 400 };
  }

  const { type } = bodyParseResult.data;

  const webhookToken = await getWebhookByToken(token);

  if (!webhookToken) {
    // TEST#3
    return { error: errors.TOKEN_NOT_FOUND, status: 401 };
  }

  const user = await getUserByPhoneHash(webhookToken.user);

  if (!user) {
    // TEST#4
    return { error: errors.USER_NOT_FOUND, status: 401 };
  }

  switch (type) {
    case "start": // TEST#5
    case "terminate": // TEST#6
      const startTerminateData = bodyParseResult.data;
      await sendStartTerminateMessage({
        type,
        phone: user.phoneHash,
        ipAddress: startTerminateData.ip_address,
      });
      break;
    case "incident": // TEST#7
    case "recovery": // TEST#8
    case "incident-symon": // TEST#9
    case "recovery-symon": {
      // TEST#10
      const incidentData = bodyParseResult.data;
      const incidentType = type.replace("-symon", "");
      await sendIncidentRecoveryMessage({
        type: incidentType as "incident" | "recovery",
        phone: user.phoneHash,
        alert: incidentData.alert,
        monika: incidentData.monika,
        time: incidentData.time,
        url: incidentData.url,
      });
      break;
    }
    case "status-update": // TEST#11
      const statusUpdateData = bodyParseResult.data;
      await sendStatusUpdateMessage({
        type,
        phone: user.phoneHash,
        time: statusUpdateData.time,
        monika: statusUpdateData.monika,
        numberOfProbes: statusUpdateData.numberOfProbes.toString(),
        averageResponseTime: statusUpdateData.averageResponseTime.toString(),
        numberOfIncidents: statusUpdateData.numberOfIncidents.toString(),
        numberOfRecoveries: statusUpdateData.numberOfRecoveries.toString(),
        numberOfSentNotifications:
          statusUpdateData.numberOfSentNotifications.toString(),
      });
      break;
  }
  // TEST#12
  return { message: "Message sent", status: 200 };
};
