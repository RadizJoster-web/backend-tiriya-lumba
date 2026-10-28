import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { paramIdSchema, updateSessionSchema } from './sessionSchema';
import { revalidateVercelTags } from '../../utils/revalidateWebhook';

export const updateSessionService = async (params: unknown, body: unknown) => {
  const { id } = paramIdSchema.parse(params);
  const validatedData = updateSessionSchema.parse(body);

  const existingSession = await prisma.sessionTime.findUnique({
    where: { id },
  });

  if (!existingSession) {
    throw new AppError(404, 'Sesi tidak ditemukan.');
  }

  const updated = await prisma.sessionTime.update({
    where: { id },
    data: validatedData,
  });

  // Purge CDN cache tags di latar belakang
  revalidateVercelTags(['sessions']);

  return updated;
};
