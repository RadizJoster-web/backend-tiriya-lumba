import { prisma } from '../../config/prisma';
import { createSessionSchema } from './sessionSchema';
import { revalidateVercelTags } from '../../utils/revalidateWebhook';

export const createSessionService = async (body: unknown) => {
  const validatedData = createSessionSchema.parse(body);

  const created = await prisma.sessionTime.create({
    data: validatedData,
  });

  // Purge CDN cache tags di latar belakang
  revalidateVercelTags(['sessions']);

  return created;
};
