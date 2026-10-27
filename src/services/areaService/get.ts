import { prisma } from '../../config/prisma';

export const getAreasService = async () => {
  return prisma.area.findMany({
    include: {
      _count: {
        select: { locations: true },
      },
    },
    orderBy: { name: 'asc' },
  });
};
