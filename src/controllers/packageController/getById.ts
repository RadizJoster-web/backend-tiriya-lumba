import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { packageIdParamSchema } from './packageSchema';

export const getPackageById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = packageIdParamSchema.parse(req.params);

    if (typeof id !== 'string' || !id) {
      return res.status(400).json({
        success: false,
        message: 'Masukan id yang sesuai',
      });
    }

    const getPackage = await prisma.location.findFirst({
      where: { id },
      select: {
        packages: {
          select: {
            id: true,
            type: true,
            price: true,
          },
        },
      },
    });

    if (!getPackage) {
      return res.status(404).json({
        success: false,
        message: 'Package ini tidak ditemukan.',
      });
    }

    return res.status(200).json({
      success: true,
      data: getPackage,
    });
  } catch (err) {
    next(err);
  }
};
