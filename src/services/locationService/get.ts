import { prisma } from '../../config/prisma';

export const getLocationsService = async () => {
  return prisma.location.findMany({
    orderBy: { name: 'desc' },
  });
};
