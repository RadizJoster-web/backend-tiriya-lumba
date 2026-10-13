import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { getSessionFilterSchema } from './sessionSchema';

export const getSessions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Validasi Query Parameter dari Request
    const { locationId, dayOfWeek } = getSessionFilterSchema.parse(req.query);

    // 2. Query Prisma: Filter berdasarkan Hari & (Lokasi Spesifik ATAU Sesi Global)
    const sessions = await prisma.sessionTime.findMany({
      where: {
        dayOfWeek: dayOfWeek,
        OR: [
          { locationId: locationId }, // Sesi khusus lokasi tersebut
          { locationId: null }, // Sesi global yang berlaku di semua lokasi
        ],
      },
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
