import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { areaIdParamSchema, updateAreaSchema } from './areaSchema';
import { revalidateVercelTags } from '../../utils/revalidateWebhook';

export const updateAreaService = async (params: unknown, body: unknown) => {
  const { id } = areaIdParamSchema.parse(params);
  const validatedData = updateAreaSchema.parse(body);

  const existingArea = await prisma.area.findUnique({
    where: { id },
  });

  if (!existingArea) {
    throw new AppError(404, 'Area/daerah tidak ditemukan.');
  }

  if (validatedData.name && validatedData.name !== existingArea.name) {
    const duplicateArea = await prisma.area.findUnique({
      where: { name: validatedData.name },
    });

    if (duplicateArea) {
      throw new AppError(400, 'Nama area/daerah sudah digunakan.');
    }
  }

  const updated = await prisma.area.update({
    where: { id },
    data: validatedData,
  });

  // Purge CDN cache tags di latar belakang
  revalidateVercelTags(['areas', 'locations', 'stats']);

  return updated;
};
