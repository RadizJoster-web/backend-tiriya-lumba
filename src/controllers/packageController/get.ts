import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';

export const getPackages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const packages = await prisma.package.findMany({
      select: {
        id: true,
        price: true,
        type: true,
        locationId: true,
        location: {
          select: {
            id: true,
            name: true,
            category: true,
            mapUrl: true,
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

    return res.status(200).json({
      success: true,
      data: packages,
    });
  } catch (err) {
    next(err);
  }
};
