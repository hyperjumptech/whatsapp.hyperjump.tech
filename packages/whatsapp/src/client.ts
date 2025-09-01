import { env } from "@workspace/env";

export interface MonikaNotificationMessageInput {
  phone: string;
  probe_url?: string;
  probe_name?: string;
  monika_id?: string;
  ip_address: string;
  response_time?: number;
  status_code?: number;
}

interface WhatsappResponseMessageID {
  id: string;
}

export interface WhatsappResponse {
  meta: {
    api_status: string;
    version: string;
  };
  messages: WhatsappResponseMessageID[];
}

export interface SuccessDataObject {
  to: string;
  msgId: string;
  status: string;
}

export const whatsappClientError = {
  FETCH_ERROR: "FETCH_ERROR",
  PARSE_JSON_ERROR: "PARSE_JSON_ERROR",
};

export class WhatsappClient {
  private readonly phoneID: string;
  private readonly accessToken: string;
  private readonly baseURL: string;

  constructor(
    phoneID: string = env.WHATSAPP_API_PHONE_ID,
    accessToken: string = env.WHATSAPP_API_ACCESS_TOKEN,
    baseURL: string = env.WHATSAPP_API_BASE_URL
  ) {
    this.phoneID = phoneID;
    this.accessToken = accessToken;
    this.baseURL = baseURL;
  }

  async send(template: string, param: string[], to: string) {
    // TEST#1
    const response = await fetch(`${this.baseURL}/${this.phoneID}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      // TEST#5
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: template,
          language: {
            code: "en",
          },
          components: [
            {
              type: "body",
              parameters: param.map((param) => {
                return {
                  type: "text",
                  text: param,
                };
              }),
            },
          ],
        },
      }),
    });

    if (!response.ok) {
      // TEST#2
      return {
        error: whatsappClientError.FETCH_ERROR,
        data: null,
      };
    }

    try {
      const data = await response.json();
      // TEST#3
      return {
        error: null,
        data,
      };
    } catch (error) {
      console.error(error);
      // TEST#4
      return {
        error: whatsappClientError.PARSE_JSON_ERROR,
        data: null,
      };
    }
  }
}
