import { prisma } from '../../config/prisma';

export const getPackagesService = async () => {
  return prisma.package.findMany({
    select: {
      id: true,
      price: true,
      type: true,
      sessionCount: true,
      locationId: true,
      location: {
        select: {
          id: true,
          name: true,
          category: true,
          mapUrl: true,
          imageUrl: true,
          area: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
};
