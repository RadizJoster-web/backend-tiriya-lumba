import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { createLocationSchema } from './locationSchema';

export const createLocationService = async (body: unknown) => {
  const validatedData = createLocationSchema.parse(body);

  const areaExists = await prisma.area.findUnique({
    where: { id: validatedData.areaId },
  });

  if (!areaExists) {
    throw new AppError(404, 'Area/daerah tidak ditemukan.');
  }

  const existingLocationInArea = await prisma.location.findFirst({
    where: {
      areaId: validatedData.areaId,
      name: validatedData.name,
    },
  });

  if (existingLocationInArea) {
    throw new AppError(
      400,
      `Lokasi kolam "${validatedData.name}" sudah terdaftar di area ini.`,
    );
  }

  return prisma.location.create({
    data: validatedData,
  });
};
