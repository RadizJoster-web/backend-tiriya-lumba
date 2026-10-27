import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { paramIdSchema, updateSessionSchema } from './sessionSchema';

export const updateSessionService = async (params: unknown, body: unknown) => {
  const { id } = paramIdSchema.parse(params);
  const validatedData = updateSessionSchema.parse(body);

  const existingSession = await prisma.sessionTime.findUnique({
    where: { id },
  });

  if (!existingSession) {
    throw new AppError(404, 'Sesi tidak ditemukan.');
  }

  return prisma.sessionTime.update({
    where: { id },
    data: validatedData,
  });
};
