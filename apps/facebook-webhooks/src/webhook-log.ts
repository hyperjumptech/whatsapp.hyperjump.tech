import { webhook_logs } from "@workspace/database";
import { getDbContext } from "@workspace/database/context";

/**
 * This function saves the webhook logs to the database.
 *
 * IMPORTANT: The function needs to be called within a context that provides a prisma client (dbContext).
 *
 * @param logs - The logs to save.
 * @returns The saved webhook logs.
 */
export const saveWebhookLog = async (logs: string): Promise<webhook_logs> => {
  const { prisma } = getDbContext();

  // TEST#1
  return prisma.webhook_logs.create({
    data: {
      logs,
    },
  });
};
