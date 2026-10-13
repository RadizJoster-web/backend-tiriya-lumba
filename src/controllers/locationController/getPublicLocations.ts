import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { getPublicLocationsQuerySchema } from './locationSchema';

export const getPublicLocations = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Parse query pagination (Default: page = 1, limit = 8)
    const { page, limit } = getPublicLocationsQuerySchema.parse(req.query);
    const skip = (page - 1) * limit;

    // 2. Query Paralel untuk efisiensi performance
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
          // Hanya ambil paket berjenis "Reguler"
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

    // 3. Flatten data agar bentuk JSON ringkas & siap konsumsi di Landing Page
    const formattedData = locations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      areaName: loc.area?.name || null,
      mapUrl: loc.mapUrl,
      regularPrice: loc.packages[0]?.price ?? null,
    }));

    const totalPages = Math.ceil(totalItems / limit);

    return res.status(200).json({
      success: true,
      data: formattedData,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};
