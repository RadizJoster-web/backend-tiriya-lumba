import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { paramIdSchema } from './sessionSchema';
import { revalidateVercelTags } from '../../utils/revalidateWebhook';

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

  // Purge CDN cache tags di latar belakang
  revalidateVercelTags(['sessions']);

  return true;
};
