import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { areaIdParamSchema } from './areaSchema';

export const deleteAreaService = async (params: unknown) => {
  const { id } = areaIdParamSchema.parse(params);

  const existingArea = await prisma.area.findUnique({
    where: { id },
    include: {
      _count: {
        select: { locations: true },
      },
    },
  });

  if (!existingArea) {
    throw new AppError(404, 'Area/daerah tidak ditemukan.');
  }

  if (existingArea._count.locations > 0) {
    throw new AppError(
      400,
      'Gagal menghapus. Area ini masih terikat dengan beberapa lokasi kolam renang.',
    );
  }

  await prisma.area.delete({
    where: { id },
  });

  return true;
};
