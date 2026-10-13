import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { locationIdParamSchema } from './locationSchema';

export const deleteLocation = async (
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

    await prisma.location.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'Lokasi kolam berhasil dihapus.',
    });
  } catch (error) {
    next(error);
  }
};
