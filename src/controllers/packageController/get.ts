import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';

export const getPackages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { category } = req.query;
    const packages = await prisma.package.findMany();

    return res.status(200).json({
      success: true,
      data: packages,
    });
  } catch (err) {
    next(err);
  }
};
