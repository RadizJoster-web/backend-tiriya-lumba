import { Request, Response, NextFunction } from 'express';
import { deletePackageService } from '../../services/packageService/delete';

export const deletePackage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await deletePackageService(req.params);
    return res.status(200).json({
      success: true,
      message: 'Package kolam berhasil dihapus.',
    });
  } catch (error) {
    next(error);
  }
};
