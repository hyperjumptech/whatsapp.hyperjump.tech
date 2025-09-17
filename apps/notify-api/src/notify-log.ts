import { getDbContext } from "@workspace/database/context";
import { NotifyType } from "@workspace/database";
import {
  IncidentRecoveryAction,
  StartTerminateAction,
  StatusUpdateAction,
} from "./validation.js";

/**
 * This function saves the notify log to the database.
 *
 * IMPORTANT: The function needs to be called within a context that provides a prisma client (dbContext).
 *
 * @param param0 - The user id and type.
 */
export const saveNotifyLog = async ({
  userId,
  type,
}: {
  userId: string;
  type: NotifyType;
}) => {
  const { prisma } = getDbContext();

  // TEST#1
  await prisma.notify_logs.create({
    data: { userId, type },
  });
};

/**
 * This function gets the notification type which can be used in the database from the received monika notification type.
 *
 * @param type - The type.
 * @returns The notify type.
 */
export const getNotifyType = (
  type: StatusUpdateAction | StartTerminateAction | IncidentRecoveryAction
): NotifyType => {
  switch (type) {
    case "status-update":
      return "status_update";
    case "incident-symon":
      return "incident";
    case "recovery-symon":
      return "recovery";
    default:
      return type as NotifyType;
  }
};
