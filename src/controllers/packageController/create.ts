import { Request, Response, NextFunction } from 'express';
import { createPackageService } from '../../services/packageService/create';

export const createPackage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const newPackage = await createPackageService(req.body);
    return res.status(201).json({
      success: true,
      message: 'Package baru berhasil ditambahkan.',
      data: newPackage,
    });
  } catch (err) {
    next(err);
  }
};
