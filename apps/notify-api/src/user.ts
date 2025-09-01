import { users } from "@workspace/database";
import { getDbContext } from "@workspace/database/context";

/**
 * This function gets the user by the phone hash.
 *
 * IMPORTANT: The function needs to be called within a context that provides a prisma client (dbContext).
 *
 * @param phoneHash - The phone hash to get the user for.
 * @returns The user if found, otherwise null.
 */
export const getUserByPhoneHash = async (
  phoneHash: string
): Promise<users | null> => {
  const { prisma } = getDbContext();
  return await prisma.users.findFirst({
    where: {
      phoneHash,
    },
  });
};
