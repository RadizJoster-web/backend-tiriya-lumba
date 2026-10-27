import { Request, Response, NextFunction } from 'express';
import { getPackagesService } from '../../services/packageService/get';

export const getPackages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const packages = await getPackagesService();
    return res.status(200).json({
      success: true,
      data: packages,
    });
  } catch (err) {
    next(err);
  }
};
