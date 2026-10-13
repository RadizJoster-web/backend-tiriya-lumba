import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { areaIdParamSchema } from './poolSchema';

export const getAreaById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = areaIdParamSchema.parse(req.params);

    if (typeof id !== 'string' || !id) {
      return res.status(400).json({
        success: false,
        message: 'Tolong masukan ID yang valid',
      });
    }

    const area = await prisma.area.findUnique({
      where: { id },
      include: {
        locations: {
          select: {
            id: true,
            name: true,
            category: true,
            mapUrl: true,
          },
        },
      },
    });

    if (!area) {
      return res.status(404).json({
        success: false,
        message: 'Area/daerah tidak ditemukan.',
      });
    }

    return res.status(200).json({
      success: true,
      data: area,
    });
  } catch (error) {
    next(error);
  }
};
