import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';

export const getSessions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { locationId } = req.query;

    const sessions = await prisma.sessionTime.findMany({
      where: locationId
        ? {
            OR: [
              { locationId: String(locationId) }, // Sesi spesifik kolam
              { locationId: null }, // Sesi global
            ],
          }
        : {},
      orderBy: [{ startTime: 'asc' }],
    });

    return res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};
