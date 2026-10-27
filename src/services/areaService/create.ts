import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { createAreaSchema } from './areaSchema';

export const createAreaService = async (body: unknown) => {
  const { name } = createAreaSchema.parse(body);

  const existingArea = await prisma.area.findUnique({
    where: { name },
  });

  if (existingArea) {
    throw new AppError(400, 'Nama area/daerah sudah terdaftar.');
  }

  return prisma.area.create({
    data: { name },
  });
};
