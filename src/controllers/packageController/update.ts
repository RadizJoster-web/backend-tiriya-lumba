import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { packageIdParamSchema, updatePackageSchema } from './packageSchema';

export const updatePackage = async (
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

    const validateData = updatePackageSchema.parse(req.body);
    const updatePackage = await prisma.package.update({
      where: { id },
      data: validateData,
    });

    return res.status(200).json({
      success: true,
      message: 'Data package berhasil diperbarui.',
      data: updatePackage,
    });
  } catch (err) {
    next(err);
  }
};
