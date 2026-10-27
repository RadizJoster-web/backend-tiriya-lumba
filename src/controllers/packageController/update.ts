import { Request, Response, NextFunction } from 'express';
import { updatePackageService } from '../../services/packageService/update';

export const updatePackage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const updatedPackage = await updatePackageService(req.params, req.body);
    return res.status(200).json({
      success: true,
      message: 'Data package berhasil diperbarui.',
      data: updatedPackage,
    });
  } catch (err) {
    next(err);
  }
};
