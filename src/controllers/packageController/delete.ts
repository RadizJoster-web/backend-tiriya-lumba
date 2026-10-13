import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { packageIdParamSchema } from './packageSchema';

export const deletePackage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = packageIdParamSchema.parse(req.params);

    if (typeof id !== 'string' || !id) {
      return res.status(400).json({
        success: false,
        message: 'Tolong masukan ID yang valid',
      });
    }

    await prisma.package.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'Package kolam berhasil dihapus.',
    });
  } catch (error) {
    next(error);
  }
};
