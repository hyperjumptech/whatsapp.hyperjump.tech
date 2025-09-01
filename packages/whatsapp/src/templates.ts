import { getWhatsappClientContext } from "./client-context.js";
import {
  actionTemplate,
  paramsForAction,
  ParamsForAction,
} from "./action-template.js";

type SendMessageInput = ParamsForAction & {
  phone: string;
};

export const errorCodes = {
  WHATSAPP_SEND_MESSAGE_ERROR: "WHATSAPP_SEND_MESSAGE_ERROR",
  WHATSAPP_TEMPLATE_NOT_FOUND: "WHATSAPP_TEMPLATE_NOT_FOUND",
} as const;

/**
 * Send a message template to a WhatsApp user.
 *
 * IMPORTANT: This function needs to be called within the context of the
 * whatsappClientContext.
 *
 * @param input - The input object that contains the phone number, the type of the action and the corresponding data for the action. @see ParamsForAction for more details on acceptable input types and the expected data structure.
 * @returns The result of the message template send operation.
 */
export const sendMessageTemplate = async (
  input: SendMessageInput
): Promise<{ error: string; data: null } | { error: null; data: any }> => {
  const { phone, ...rest } = input;
  const template = actionTemplate[rest.type];
  if (!template) {
    // TEST#1
    return {
      error: errorCodes.WHATSAPP_TEMPLATE_NOT_FOUND,
      data: null,
    };
  }

  const whatsappClient = getWhatsappClientContext().whatsappClient;
  // TEST#2
  const result = await whatsappClient.send(
    template,
    paramsForAction(rest),
    phone
  );
  if (result.error) {
    // TEST#3
    return {
      error: result.error,
      data: null,
    };
  }
  if (!result.data || !result.data.messages.length) {
    // TEST#4
    return {
      error: errorCodes.WHATSAPP_SEND_MESSAGE_ERROR,
      data: null,
    };
  }

  // TEST#5
  return {
    error: null,
    data: result.data,
  };
};
