import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { locationIdParamSchema, updateLocationSchema } from './locationSchema';
import { revalidateVercelTags } from '../../utils/revalidateWebhook';

export const updateLocationService = async (params: unknown, body: unknown) => {
  const { id } = locationIdParamSchema.parse(params);
  const validatedData = updateLocationSchema.parse(body);

  if (validatedData.areaId) {
    const areaExists = await prisma.area.findUnique({
      where: { id: validatedData.areaId },
    });
    if (!areaExists) {
      throw new AppError(404, 'Area/daerah tujuan tidak ditemukan.');
    }
  }

  const updated = await prisma.location.update({
    where: { id },
    data: validatedData,
  });

  // Purge CDN cache tags di latar belakang
  revalidateVercelTags(['locations', 'stats']);

  return updated;
};
