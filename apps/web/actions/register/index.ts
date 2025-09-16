/*
This file contains the main logic for the register action.

To use the register action in the client component, you need to import the `register` function from the `action.ts` file.
*/

import { functionCreator } from "@/lib/context/helper";
import {
  createOrRefreshRegistration,
  getRegistrationByPhoneHash,
} from "@/lib/repositories/registrations";
import { getUserByPhoneHash } from "@/lib/repositories/user";
import { redirect } from "next/navigation";
import { z } from "zod";
import { sendConfirmPhoneMessage } from "@workspace/whatsapp/send-message";
import { normalizePhone } from "@workspace/utils/phone";

/**
 * This object contains the error codes that can be returned by the register function.
 */
export const errorCodes = {
  INVALID_DATA: "INVALID_DATA",
  PHONE_NUMBER_ALREADY_REGISTERED: "PHONE_NUMBER_ALREADY_REGISTERED",
  REGISTRATION_ALREADY_ATTEMPTED: "REGISTRATION_ALREADY_ATTEMPTED",
} as const;

/**
 * This schema is used to validate the data passed to the register function.
 */
const registerSchema = z.object({
  name: z.string().min(3),
  phone: z.string().min(10),
});

/**
 * This function registers a user. When successful, it will immediately redirect to the confirm page.
 *
 * IMPORTANT: The function needs to be called within a context that provides a prisma client (dbContext).
 *
 * @param data - The data to register the user for.
 * @returns The error code if the data is invalid or the phone number is already registered or the registration is already attempted.
 */
const register = async (data: {
  name: string;
  phone: string;
}): Promise<
  | undefined
  | {
      error: string;
    }
> => {
  const parseResult = registerSchema.safeParse(data);

  // TEST#1
  if (!parseResult.success) {
    return {
      error: errorCodes.INVALID_DATA,
    };
  }

  const normalizedPhone = normalizePhone(data.phone);

  const existingUser = await getUserByPhoneHash(normalizedPhone);
  // TEST#2
  if (existingUser) {
    return {
      error: errorCodes.PHONE_NUMBER_ALREADY_REGISTERED,
    };
  }

  const registration = await getRegistrationByPhoneHash(normalizedPhone);
  // TEST#3
  if (registration && registration.expiredAt > new Date()) {
    return {
      error: errorCodes.REGISTRATION_ALREADY_ATTEMPTED,
    };
  }

  const newRegistration = await createOrRefreshRegistration(
    registration,
    normalizedPhone,
    data.name
  );

  // TEST#4
  await sendConfirmPhoneMessage({
    name: data.name,
    activationToken: newRegistration.token,
    phone: normalizedPhone,
    expiredAt: newRegistration.expiredAt.toISOString(),
  });

  // TEST#5
  redirect("/confirm");
};

/**
 * This function returns **a register action CREATOR**. IT DOES NOT CREATE THE SERVER ACTION OR SERVER FUNCTION ITSELF.
 *
 * Using the creator, you can create a server action or server function that can be called from the client.
 *
 * The default (production) server action is in the /actions/register/action.ts file.
 *
 * For testing, you can create a server function that uses its own prisma, whatsapp client, etc.
 *
 * @example
 * ```ts
 * export const register = registerActionCreator();
 * ```
 *
 * The exported register above is a server function that can be called from the client component.
 */
export const registerActionCreator = functionCreator(register);
