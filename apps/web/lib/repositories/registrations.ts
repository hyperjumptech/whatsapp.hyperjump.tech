import { getDbContext } from "@/lib/context/db";
import { registrations } from "@workspace/database";
import { getRandomContext } from "@workspace/utils/random-context";

/**
 * This function gets a registration by phone hash.
 *
 * IMPORTANT: The function needs to be called within a context that provides a prisma client (dbContext).
 *
 * @param phoneHash - The phone hash to get the registration for.
 * @returns The registration.
 */
export const getRegistrationByPhoneHash = async (phoneHash: string) => {
  // TEST#1
  const { prisma } = getDbContext();
  return prisma.registrations.findFirst({
    where: {
      phoneHash,
    },
  });
};

/**
 * This function gets a registration by token.
 *
 * IMPORTANT: The function needs to be called within a context that provides a prisma client (dbContext).
 *
 * @param token - The token to get the registration for.
 * @returns The registration.
 */
export const getRegistrationByToken = async (token: string) => {
  // TEST#1
  const { prisma } = getDbContext();
  return prisma.registrations.findUnique({
    where: {
      token,
    },
  });
};

/**
 * This function creates a new registration or refreshes an existing one.
 *
 * IMPORTANT: The function needs to be called within a context that provides a prisma client (dbContext) and a uuid function (randomContext). The uuid function is used to generate a unique activation token.
 *
 * @param registration - The registration to create or refresh.
 * @param phoneHash - The phone hash to create or refresh the registration for.
 * @param name - The name to create or refresh the registration for.
 * @returns The created or refreshed registration.
 */
export const createOrRefreshRegistration = async (
  registration: registrations | null,
  phoneHash: string,
  name: string
) => {
  const { uuid } = getRandomContext();

  const activationToken = uuid();
  const now = new Date();
  now.setMinutes(now.getMinutes() + 10);
  const newExpireDate = new Date(now);

  const { prisma } = getDbContext();

  if (!registration) {
    // TEST#1
    return prisma.registrations.create({
      data: {
        phoneHash,
        name,
        token: activationToken,
        expiredAt: newExpireDate,
      },
    });
  } else {
    // TEST#2
    return prisma.registrations.update({
      where: {
        phoneHash: registration.phoneHash,
      },
      data: {
        token: activationToken,
        expiredAt: newExpireDate,
      },
    });
  }
};

/**
 * This function deletes a registration by phone hash.
 *
 * IMPORTANT: The function needs to be called within a context that provides a prisma client (dbContext).
 *
 * @param phoneHash - The phone hash to delete the registration for.
 * @returns The deleted registration.
 */
export const deleteRegistrationByPhoneHash = async (phoneHash: string) => {
  // TEST#3
  const { prisma } = getDbContext();
  return prisma.registrations.delete({
    where: {
      phoneHash,
    },
  });
};
