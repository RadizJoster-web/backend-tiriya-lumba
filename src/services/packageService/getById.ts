import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { packageIdParamSchema } from './packageSchema';

export const getPackageByIdService = async (params: unknown) => {
  const { id } = packageIdParamSchema.parse(params);

  const getPackage = await prisma.location.findFirst({
    where: { id },
    select: {
      packages: {
        select: {
          id: true,
          type: true,
          price: true,
        },
      },
    },
  });

  if (!getPackage) {
    throw new AppError(404, 'Package ini tidak ditemukan.');
  }

  return getPackage;
};
