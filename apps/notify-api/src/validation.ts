import { z } from "zod";
import { actionTemplate } from "@workspace/whatsapp/action-template";

type ActionType = keyof typeof actionTemplate;
export type StartTerminateAction = Extract<ActionType, "start" | "terminate">;
export type IncidentRecoveryAction = Extract<
  ActionType,
  "incident" | "recovery" | "incident-symon" | "recovery-symon"
>;
export type StatusUpdateAction = Extract<ActionType, "status-update">;

const startTerminateActionTypes: StartTerminateAction[] = [
  "start",
  "terminate",
];

const incidentRecoveryActionTypes: IncidentRecoveryAction[] = [
  "incident",
  "recovery",
  "incident-symon",
  "recovery-symon",
];

const statusUpdateActionTypes: StatusUpdateAction[] = ["status-update"];

/**
 * This is the schema for the request body.
 */
export const notifyBodySchema = z.discriminatedUnion("type", [
  z.object({
    type: z.enum(
      startTerminateActionTypes as [
        StartTerminateAction,
        ...StartTerminateAction[],
      ]
    ),
    ip_address: z.string(),
  }),
  z.object({
    type: z.enum(
      incidentRecoveryActionTypes as [
        IncidentRecoveryAction,
        ...IncidentRecoveryAction[],
      ]
    ),
    alert: z.string(),
    url: z.string(),
    time: z.string(),
    monika: z.string(),
  }),
  z.object({
    type: z.enum(
      statusUpdateActionTypes as [StatusUpdateAction, ...StatusUpdateAction[]]
    ),
    time: z.string(),
    monika: z.string(),
    numberOfProbes: z.number(),
    averageResponseTime: z.number(),
    numberOfIncidents: z.number(),
    numberOfRecoveries: z.number(),
    numberOfSentNotifications: z.number(),
  }),
]);

/**
 * This is the schema for the request query.
 */
export const notifyQuerySchema = z.object({
  token: z.string(),
});
