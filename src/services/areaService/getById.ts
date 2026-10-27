import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { areaIdParamSchema } from './areaSchema';

export const getAreaByIdService = async (params: unknown) => {
  const { id } = areaIdParamSchema.parse(params);

  const area = await prisma.area.findUnique({
    where: { id },
    include: {
      locations: {
        select: {
          id: true,
          name: true,
          category: true,
          mapUrl: true,
        },
      },
    },
  });

  if (!area) {
    throw new AppError(404, 'Area/daerah tidak ditemukan.');
  }

  return area;
};
