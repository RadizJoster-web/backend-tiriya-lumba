import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { paramIdSchema } from './poolManagerSchema';

export const deletePoolManagerService = async (params: unknown) => {
  const { id } = paramIdSchema.parse(params);

  const existingManager = await prisma.user.findFirst({
    where: { id, role: 'POOL_MANAGER' },
  });

  if (!existingManager) {
    throw new AppError(404, 'Manager kolam renang tidak ditemukan.');
  }

  await prisma.user.delete({
    where: { id },
  });

  return true;
};
