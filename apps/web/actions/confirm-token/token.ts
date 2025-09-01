import { getRegistrationByToken } from "@/lib/repositories/registrations";
import { registrations } from "@workspace/database";

/**
 * This function checks if a token is valid.
 *
 * IMPORTANT: The function needs to be called within a context that provides a prisma client (dbContext).
 *
 * @param token - The token to check.
 * @returns The registration if the token is valid, otherwise null.
 */
export const isTokenValid = async (
  token: string
): Promise<registrations | null> => {
  const registration = await getRegistrationByToken(token);
  // TEST#1
  if (!registration) {
    return null;
  }
  // TEST#2
  if (registration.expiredAt < new Date()) {
    return null;
  }
  // TEST#3
  return registration;
};
