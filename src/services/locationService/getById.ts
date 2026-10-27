import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { locationIdParamSchema } from './locationSchema';

export const getLocationByIdService = async (params: unknown) => {
  const { id } = locationIdParamSchema.parse(params);

  const location = await prisma.location.findUnique({
    where: { id },
  });

  if (!location) {
    throw new AppError(404, 'Lokasi kolam tidak ditemukan.');
  }

  return location;
};
