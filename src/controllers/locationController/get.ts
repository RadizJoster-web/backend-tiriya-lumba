import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';

export const getLocations = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const locations = await prisma.location.findMany({
      orderBy: { name: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: locations,
    });
  } catch (err) {
    next(err);
  }
};
