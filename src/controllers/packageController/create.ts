import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { createPackageSchema } from './packageSchema';

export const createPackage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validateData = createPackageSchema.parse(req.body);
    const newPackage = await prisma.package.create({
      data: validateData,
    });

    return res.status(201).json({
      success: true,
      message: 'Package baru berhasil ditambahkan.',
      data: newPackage,
    });
  } catch (err) {
    next(err);
  }
};
