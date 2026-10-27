import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { paramIdSchema, userSelectWithoutPassword } from './poolManagerSchema';

export const getPoolManagerByIdService = async (params: unknown) => {
  const { id } = paramIdSchema.parse(params);

  const manager = await prisma.user.findFirst({
    where: { id, role: 'POOL_MANAGER' },
    select: userSelectWithoutPassword,
  });

  if (!manager) {
    throw new AppError(404, 'Manager kolam renang tidak ditemukan.');
  }

  return manager;
};
