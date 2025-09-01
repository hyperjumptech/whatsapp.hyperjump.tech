import { getDbContext } from "../context/db";

export const getUserByPhoneHash = async (phoneHash: string) => {
  // TEST#1
  const { prisma } = getDbContext();
  return prisma.users.findUnique({
    where: {
      phoneHash,
    },
  });
};

export const saveUser = async (reg: { phoneHash: string; name: string }) => {
  // TEST#2
  const { prisma } = getDbContext();
  const { phoneHash, name } = reg;
  return prisma.users.create({
    data: {
      phoneHash,
      name,
    },
  });
};

export const deleteUserByPhoneHash = async (phoneHash: string) => {
  // TEST#3
  const { prisma } = getDbContext();
  return prisma.users.delete({
    where: {
      phoneHash,
    },
  });
};
