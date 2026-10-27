import { prisma } from '../../config/prisma';
import { userSelectWithoutPassword } from './poolManagerSchema';

export const getPoolManagersService = async (locationId?: unknown) => {
  return prisma.user.findMany({
    where: {
      role: 'POOL_MANAGER',
      ...(locationId ? { locationId: String(locationId) } : {}),
    },
    select: userSelectWithoutPassword,
    orderBy: { fullName: 'asc' },
  });
};
