import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { createAreaSchema } from './areaSchema';
import { revalidateVercelTags } from '../../utils/revalidateWebhook';

export const createAreaService = async (body: unknown) => {
  const { name } = createAreaSchema.parse(body);

  const existingArea = await prisma.area.findUnique({
    where: { name },
  });

  if (existingArea) {
    throw new AppError(400, 'Nama area/daerah sudah terdaftar.');
  }

  const created = await prisma.area.create({
    data: { name },
  });

  // Purge CDN cache tags di latar belakang
  revalidateVercelTags(['areas', 'locations', 'stats']);

  return created;
};
