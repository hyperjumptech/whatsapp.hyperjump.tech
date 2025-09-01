import { env } from "@workspace/env";
import { getDbContext } from "../context/db";
import { getTimeContext } from "@workspace/utils/time-context";

/**
 * This function saves a webhook token.
 *
 * IMPORTANT: The function needs to be called within a context that provides a prisma client (dbContext).
 *
 * @param name - The name of the webhook token.
 * @param user - The user of the webhook token.
 * @returns The webhook token.
 */
export const saveWebhookToken = async (name: string, user: string) => {
  const { prisma } = getDbContext();
  // TEST#1
  return prisma.webhook_token.create({
    data: {
      name,
      user,
    },
  });
};

/**
 * This function gets a webhook token by token.
 *
 * IMPORTANT: The function needs to be called within a context that provides a prisma client (dbContext).
 *
 * @param token - The token to get the webhook token for.
 * @returns The webhook token.
 */
export const getWebhookByToken = async (token: string) => {
  const { prisma } = getDbContext();
  // TEST#2
  return prisma.webhook_token.findUnique({
    where: {
      token,
    },
  });
};

/**
 * This function deletes a webhook token by token.
 *
 * IMPORTANT: The function needs to be called within a context that provides a prisma client (dbContext).
 *
 * @param token - The token to delete the webhook token for.
 * @returns The webhook token.
 */
export const deleteWebhookByToken = async (token: string) => {
  const { prisma } = getDbContext();
  // TEST#3
  return prisma.webhook_token.delete({
    where: {
      token,
    },
  });
};

/**
 * This function gets a webhook token by user.
 *
 * IMPORTANT: The function needs to be called within a context that provides a prisma client (dbContext).
 *
 * @param user - The user to get the webhook token for.
 * @returns The webhook token.
 */
export const getWebhookByUser = async (user: string) => {
  const { prisma } = getDbContext();
  // TEST#4
  return prisma.webhook_token.findFirst({
    where: {
      user,
    },
  });
};

/**
 * This function updates the resend at of a webhook token.
 *
 * IMPORTANT: The function needs to be called within a context that provides a prisma client (dbContext) and time context.
 *
 * @param token - The token to update the resend at for.
 * @returns The webhook token.
 */
export const updateWebhookResendAt = async (token: string) => {
  const { prisma } = getDbContext();
  const { now } = getTimeContext();
  const current = now();
  // TEST#5
  return prisma.webhook_token.update({
    where: {
      token,
    },
    data: {
      // resend at is 15 minutes from now or the number in the env variable
      resendAt: new Date(
        current.getTime() +
          (env.NEXT_PUBLIC_WEBHOOK_RESEND_COOLDOWN_TIME ?? 15 * 60) * 1000
      ),
    },
  });
};
