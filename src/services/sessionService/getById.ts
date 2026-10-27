import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { paramIdSchema } from './sessionSchema';

export const getSessionByIdService = async (params: unknown) => {
  const { id } = paramIdSchema.parse(params);

  const session = await prisma.sessionTime.findUnique({
    where: { id },
  });

  if (!session) {
    throw new AppError(404, 'Sesi tidak ditemukan.');
  }

  return session;
};
