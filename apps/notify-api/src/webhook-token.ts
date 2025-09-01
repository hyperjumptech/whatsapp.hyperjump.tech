import { webhook_token } from "@workspace/database";
import { getDbContext } from "@workspace/database/context";

/**
 * This function gets the webhook token by the token.
 *
 * IMPORTANT: The function needs to be called within a context that provides a prisma client (dbContext).
 *
 * @param token - The token to get the webhook token for.
 * @returns The webhook token if found, otherwise null.
 */
export const getWebhookByToken = async (
  token: string
): Promise<webhook_token | null> => {
  const { prisma } = getDbContext();
  return await prisma.webhook_token.findFirst({
    where: {
      token,
    },
  });
};
