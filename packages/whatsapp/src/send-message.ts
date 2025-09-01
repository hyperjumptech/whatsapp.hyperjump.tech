import { env } from "@workspace/env";
import { sendMessageTemplate } from "./templates.js";
import { actionTemplate } from "./action-template.js";
import { removeTrailingSlash } from "@workspace/utils/url";

/**
 * Send a confirmation message to a WhatsApp user.
 *
 * IMPORTANT: This function needs to be called within the context of the
 * whatsappClientContext.
 *
 * @param input - The input arguments for the confirmation message.
 * @returns The result of the confirmation message send operation.
 */
export const sendConfirmPhoneMessage = async (input: {
  name: string;
  activationToken: string;
  phone: string;
  expiredAt: string;
}) => {
  const { name, activationToken, phone, expiredAt } = input;
  const activationLink = `${env.NEXT_PUBLIC_BASE_URL}/confirm/${activationToken}`;

  // TEST#1
  await sendMessageTemplate({
    phone,
    type: "confirmation",
    input: {
      name,
      activationLink,
      expiredAt,
    },
  });
};

/**
 * Send an instruction message to a WhatsApp user.
 *
 * IMPORTANT: This function needs to be called within the context of the
 * whatsappClientContext.
 *
 * @param input - The input arguments for the instruction message.
 * @returns The result of the instruction message send operation.
 */
export const sendInstructionMessage = async (input: {
  phone: string;
  webhookToken: string;
}) => {
  const { phone, webhookToken } = input;

  // TEST#2
  await sendMessageTemplate({
    phone,
    type: "instruction",
    input: {
      // This is the URL that the user will use in their Monika config
      notifyWebhookUrl: `${removeTrailingSlash(env.NEXT_PUBLIC_MONIKA_NOTIFY_API_URL)}/api/notify?token=${webhookToken}`,
      // This is the URL that the user needs to visit to delete the webhook
      deleteWebhookUrl: `${removeTrailingSlash(env.NEXT_PUBLIC_BASE_URL)}/delete/${webhookToken}`,
      // This is the URL that the user can visit to get more information about using Monika with WhatsApp
      docsUrl: `${removeTrailingSlash(env.NEXT_PUBLIC_MONIKA_NOTIF_DOC ?? "")}`,
    },
  });
};

/**
 * Send a start or terminate message to a WhatsApp user.
 *
 * IMPORTANT: This function needs to be called within the context of the
 * whatsappClientContext.
 *
 * @param input - The input arguments for the start or terminate message.
 * @returns The result of the start or terminate message send operation.
 */
export const sendStartTerminateMessage = async (input: {
  phone: string;
  type: Extract<keyof typeof actionTemplate, "start" | "terminate">;
  ipAddress: string;
}) => {
  const { phone, type, ipAddress } = input;

  // TEST#3
  await sendMessageTemplate({
    phone,
    type,
    input: {
      ipAddress,
    },
  });
};

/**
 * Send an incident or recovery message to a WhatsApp user.
 *
 * IMPORTANT: This function needs to be called within the context of the
 * whatsappClientContext.
 *
 * @param input - The input arguments for the incident or recovery message.
 * @returns The result of the incident or recovery message send operation.
 */
export const sendIncidentRecoveryMessage = async (input: {
  phone: string;
  type: Extract<keyof typeof actionTemplate, "incident" | "recovery">;
  alert: string;
  url: string;
  time: string;
  monika: string;
}) => {
  const { phone, type, alert, url, time, monika } = input;

  // TEST#4
  await sendMessageTemplate({
    phone,
    type,
    input: { alert, url, time, monika },
  });
};

/**
 * Send a status update message to a WhatsApp user.
 *
 * IMPORTANT: This function needs to be called within the context of the
 * whatsappClientContext.
 *
 * @param input - The input arguments for the status update message.
 * @returns The result of the status update message send operation.
 */
export const sendStatusUpdateMessage = async (input: {
  phone: string;
  type: Extract<keyof typeof actionTemplate, "status-update">;
  time: string;
  monika: string;
  numberOfProbes: string;
  averageResponseTime: string;
  numberOfIncidents: string;
  numberOfRecoveries: string;
  numberOfSentNotifications: string;
}) => {
  const {
    phone,
    type,
    time,
    monika,
    numberOfProbes,
    averageResponseTime,
    numberOfIncidents,
    numberOfRecoveries,
    numberOfSentNotifications,
  } = input;

  // TEST#5
  await sendMessageTemplate({
    phone,
    type,
    input: {
      time,
      monika,
      numberOfProbes,
      averageResponseTime,
      numberOfIncidents,
      numberOfRecoveries,
      numberOfSentNotifications,
    },
  });
};
