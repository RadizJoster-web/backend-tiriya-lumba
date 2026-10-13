import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';

export const getAreas = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const areas = await prisma.area.findMany({
      include: {
        _count: {
          select: { locations: true }, // Menampilkan jumlah kolam di area tersebut
        },
      },
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({
      success: true,
      data: areas,
    });
  } catch (error) {
    next(error);
  }
};
