import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';

export const getPackages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const packages = await prisma.package.findMany({
      where: { type: 'Reguler' },
      select: {
        price: true,
        location: {
          // huruf kecil 'location'
          select: {
            name: true,
            category: true,
            mapUrl: true,
            area: {
              // Area diambil dari dalam relasi location
              select: {
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
