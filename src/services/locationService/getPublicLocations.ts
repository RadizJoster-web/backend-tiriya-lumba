import { prisma } from '../../config/prisma';
import { getPublicLocationsQuerySchema } from './locationSchema';

export const getPublicLocationsService = async (query: unknown) => {
  const { page, limit } = getPublicLocationsQuerySchema.parse(query);
  const skip = (page - 1) * limit;

  const [totalItems, locations] = await Promise.all([
    prisma.location.count(),
    prisma.location.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        mapUrl: true,
        area: {
          select: {
            name: true,
          },
        },
        packages: {
          where: {
            type: {
              equals: 'Reguler',
            },
          },
          select: {
            price: true,
          },
          take: 1,
        },
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  const formattedData = locations.map((loc) => ({
    id: loc.id,
    name: loc.name,
    areaName: loc.area?.name || null,
    mapUrl: loc.mapUrl,
    regularPrice: loc.packages[0]?.price ?? null,
  }));

  const totalPages = Math.ceil(totalItems / limit);

  return {
    data: formattedData,
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      limit,
    },
  };
};
