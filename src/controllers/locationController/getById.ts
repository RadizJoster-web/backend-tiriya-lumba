import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { locationIdParamSchema } from './locationSchema';

export const getLocationById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = locationIdParamSchema.parse(req.params);

    if (typeof id !== 'string' || !id) {
      return res.status(400).json({
        success: false,
        message: 'Tolong masukan ID yang valid',
      });
    }

    const location = await prisma.location.findUnique({
      where: { id },
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Lokasi kolam tidak ditemukan.',
      });
    }

    return res.status(200).json({
      success: true,
      data: location,
    });
  } catch (err) {
    next(err);
  }
};
