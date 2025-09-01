/*
This file contains the main logic for the confirm token action.

To use the confirm token action in the client component, you need to import the `confirmToken` function from the `action.ts` file.
*/

import { functionCreator } from "@/lib/context/helper";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isTokenValid } from "./token";
import { saveUser } from "@/lib/repositories/user";
import { saveWebhookToken } from "@/lib/repositories/webhook-token";
import { sendInstructionMessage } from "@workspace/whatsapp/send-message";
import { getDbContext, runWithContext } from "@/lib/context/db";
import { PrismaClient } from "@workspace/database";
import { deleteRegistrationByPhoneHash } from "@/lib/repositories/registrations";

/**
 * This object contains the error codes that can be returned by the confirmToken function.
 */
export const errorCodes = {
  INVALID_TOKEN: "INVALID_TOKEN",
  INVALID_DATA: "INVALID_DATA",
} as const;

/**
 * This schema is used to validate the data passed to the confirmToken function.
 */
const confirmTokenSchema = z.object({
  token: z.string().min(1),
});

/**
 * This function confirms a token. When successful, it will immediately redirect to the confirmed page.
 *
 * IMPORTANT: The function needs to be called within a context that provides a prisma client (dbContext).
 *
 * @param data - The data to confirm the token for.
 * @returns The error code if the token is not found or the user is not found.
 */
const confirmToken = async (data: {
  token: string;
}): Promise<{
  error: string;
}> => {
  const parseResult = confirmTokenSchema.safeParse(data);

  if (!parseResult.success) {
    // TEST#1
    return {
      error: errorCodes.INVALID_DATA,
    };
  }

  const isValid = await isTokenValid(data.token);
  if (!isValid) {
    // TEST#2
    return {
      error: errorCodes.INVALID_TOKEN,
    };
  }

  const prisma = getDbContext().prisma;
  // Run the saving user, saving webhook token and deleting registration in a transaction.
  const { user, webhook } = await prisma.$transaction(async (tx) => {
    return runWithContext({ prisma: tx as PrismaClient }, async () => {
      // TEST#3
      const user = await saveUser({
        phoneHash: isValid.phoneHash,
        name: isValid.name,
      });

      // TEST#3
      const webhook = await saveWebhookToken(user.name, user.phoneHash);

      // Delete the registration after saving the user and webhook token because we don't need it anymore.
      // TEST#3
      await deleteRegistrationByPhoneHash(isValid.phoneHash);

      return { user, webhook };
    });
  });

  // TEST#3
  await sendInstructionMessage({
    phone: user.phoneHash,
    webhookToken: webhook.token,
  });

  // TEST#4
  redirect("/confirmed");
};

/**
 * This function returns **a confirmToken action CREATOR**. IT DOES NOT CREATE THE SERVER ACTION OR SERVER FUNCTION ITSELF.
 *
 * Using the creator, you can create a server action or server function that can be called from the client.
 *
 * The default (production) server action is in the /actions/confirm-token/action.ts file.
 *
 * For testing, you can create a server function that uses its own prisma, whatsapp client, etc.
 *
 * @example
 * ```ts
 * export const confirmToken = confirmTokenActionCreator();
 * ```
 *
 * The exported confirmToken above is a server function that can be called from the client component.
 */
export const confirmTokenActionCreator = functionCreator(confirmToken);
