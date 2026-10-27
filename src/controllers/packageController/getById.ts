import { Request, Response, NextFunction } from 'express';
import { getPackageByIdService } from '../../services/packageService/getById';

export const getPackageById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const getPackage = await getPackageByIdService(req.params);
    return res.status(200).json({
      success: true,
      data: getPackage,
    });
  } catch (err) {
    next(err);
  }
};
