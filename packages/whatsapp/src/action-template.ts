// Maps the action type to the WhatsApp template name.
export const actionTemplate = {
  confirmation: "confirmation",
  instruction: "instruction",
  start: "start_message",
  incident: "incident",
  recovery: "recovery",
  "incident-symon": "incident_20240426",
  "recovery-symon": "recovery_20240426",
  terminate: "termination",
  "status-update": "status_update",
} as const;

export type ConfirmationMessageInput = {
  name: string;
  activationLink: string;
  expiredAt: string;
};

export type InstructionMessageInput = {
  notifyWebhookUrl: string;
  docsUrl: string;
  deleteWebhookUrl: string;
};

export type StartTerminateMessageInput = {
  ipAddress: string;
};

export type IncidentRecoveryMessageInput = {
  alert: string;
  url: string;
  time: string;
  monika: string;
};

export type StatusUpdateMessageInput = {
  time: string;
  monika: string;
  numberOfProbes: string;
  averageResponseTime: string;
  numberOfIncidents: string;
  numberOfRecoveries: string;
  numberOfSentNotifications: string;
};

/**
 * The type of the input for the action template.
 *
 * @param type - The type of the action.
 * @param input - The input object that contains the data for the action.
 */
export type ParamsForAction =
  | {
      type: "confirmation";
      input: ConfirmationMessageInput;
    }
  | {
      type: "instruction";
      input: InstructionMessageInput;
    }
  | {
      type: "start";
      input: StartTerminateMessageInput;
    }
  | {
      type: "incident";
      input: IncidentRecoveryMessageInput;
    }
  | {
      type: "recovery";
      input: IncidentRecoveryMessageInput;
    }
  | {
      type: "incident-symon";
      input: IncidentRecoveryMessageInput;
    }
  | {
      type: "recovery-symon";
      input: IncidentRecoveryMessageInput;
    }
  | {
      type: "terminate";
      input: StartTerminateMessageInput;
    }
  | {
      type: "status-update";
      input: StatusUpdateMessageInput;
    };

export function paramsForAction(arg: ParamsForAction): any[] {
  switch (arg.type) {
    case "confirmation":
      // TEST#1
      return [arg.input.name, arg.input.activationLink, arg.input.expiredAt];
    case "instruction":
      // TEST#2
      return [
        arg.input.notifyWebhookUrl,
        arg.input.notifyWebhookUrl,
        arg.input.docsUrl,
        arg.input.deleteWebhookUrl,
      ];
    case "start":
    case "terminate":
      // TEST#3
      return [arg.input.ipAddress];
    case "incident":
    case "incident-symon":
    case "recovery-symon":
    case "recovery":
      // TEST#4
      return [arg.input.alert, arg.input.url, arg.input.time, arg.input.monika];
    case "status-update":
      // TEST#5
      return [
        arg.input.time,
        arg.input.monika,
        arg.input.numberOfProbes,
        arg.input.averageResponseTime,
        arg.input.numberOfIncidents,
        arg.input.numberOfRecoveries,
        arg.input.numberOfSentNotifications,
      ];
    default:
      // TEST#6
      // @ts-expect-error - This is a valid action type
      throw new Error(`Unknown action type: ${arg.type}`);
  }
}

export const explanation: Record<keyof typeof actionTemplate, string> = {
  start:
    "When Monika is started, it will send a notification to make sure the configuration is correct.",
  incident:
    "When the website Monika is monitoring down (status code not 2xx), it will send a notification to notify about the incident.",
  recovery:
    "When the website Monika is monitoring recover from an incident, it will send a notification to notify about the recovery.",
  terminate:
    "When Monika is terminated, it will send a notification to notify about the termination.",
  "status-update":
    "When Monika is configured with status update schedule, it will send status notification periodically based on the schedule.",
  confirmation: "",
  instruction: "",
  "incident-symon": "",
  "recovery-symon": "",
};
