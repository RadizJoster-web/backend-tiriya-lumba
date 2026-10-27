import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { paramIdSchema } from './sessionSchema';

export const deleteSessionService = async (params: unknown) => {
  const { id } = paramIdSchema.parse(params);

  const existingSession = await prisma.sessionTime.findUnique({
    where: { id },
  });

  if (!existingSession) {
    throw new AppError(404, 'Sesi tidak ditemukan.');
  }

  await prisma.sessionTime.delete({
    where: { id },
  });

  return true;
};
