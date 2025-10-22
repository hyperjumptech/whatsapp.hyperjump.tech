import { functionCreator } from "@/lib/context/helper";
import {
  deleteUserByPhoneHash,
  getUserByPhoneHash,
} from "@/lib/repositories/user";
import {
  deleteWebhookByToken,
  getWebhookByToken,
} from "@/lib/repositories/webhook-token";
import { PrismaClient } from "@workspace/database";
import { getDbContext, runWithContext } from "@workspace/database/context";
import { redirect } from "next/navigation";
import { z } from "zod";

/**
 * This schema is used to validate the data passed to the deleteToken function.
 */
const deleteTokenSchema = z.object({
  token: z.string().min(1),
});

/**
 * This object contains the error codes that can be returned by the deleteToken function.
 */
export const errorCodes = {
  INVALID_DATA: "INVALID_DATA",
  WEBHOOK_TOKEN_NOT_FOUND: "WEBHOOK_TOKEN_NOT_FOUND",
  USER_NOT_FOUND: "USER_NOT_FOUND",
};

/**
 * This function deletes a token. When successful, it will immediately redirect to the delete success page.
 *
 * IMPORTANT: The function needs to be called within a context that provides a prisma client (dbContext).
 *
 * @param data - The data to delete the token for.
 * @returns The error code if the token is not found or the user is not found.
 */
const deleteToken = async (data: {
  token: string;
}): Promise<{
  error: string;
}> => {
  const parseResult = deleteTokenSchema.safeParse(data);

  if (!parseResult.success) {
    // TEST#1
    return {
      error: errorCodes.INVALID_DATA,
    };
  }

  const webhookToken = await getWebhookByToken(data.token);

  if (!webhookToken) {
    // TEST#2
    return {
      error: errorCodes.WEBHOOK_TOKEN_NOT_FOUND,
    };
  }

  const user = await getUserByPhoneHash(webhookToken.user);

  if (!user) {
    // TEST#3
    return {
      error: errorCodes.USER_NOT_FOUND,
    };
  }

  const { phoneHash } = user;

  // TEST#4
  const { prisma } = getDbContext();
  // Run the deleting user, webhook token and webhook token in a transaction.
  await prisma.$transaction(async (tx) => {
    return runWithContext({ prisma: tx as PrismaClient }, async () => {
      await deleteUserByPhoneHash(phoneHash);
      await deleteWebhookByToken(webhookToken.token);
    });
  });

  // TEST#7
  redirect("/delete/success");
};

/**
 * This function returns **a deleteToken action CREATOR**. IT DOES NOT CREATE THE SERVER ACTION OR SERVER FUNCTION ITSELF.
 *
 * Using the creator, you can create a server action or server function that can be called from the client.
 *
 * The default (production) server action is in the /actions/delete-token/action.ts file.
 *
 * For testing, you can create a server function that uses its own prisma, whatsapp client, etc.
 *
 * @example
 * ```ts
 * export const deleteToken = deleteTokenActionCreator();
 * ```
 *
 * The exported deleteToken above is a server function that can be called from the client component.
 */
export const deleteTokenActionCreator = functionCreator(deleteToken);
