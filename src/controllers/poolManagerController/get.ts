import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';

const userSelectWithoutPassword = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  role: true,
  isVerified: true,
  isActive: true,
  locationId: true,
  location: {
    select: {
      name: true,
      area: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
};

export const getPoolManagers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { locationId } = req.query;

    const managers = await prisma.user.findMany({
      where: {
        role: 'POOL_MANAGER',
        ...(locationId ? { locationId: String(locationId) } : {}),
      },
      select: userSelectWithoutPassword,
      orderBy: { fullName: 'asc' },
    });

    return res.status(200).json({
      success: true,
      data: managers,
    });
  } catch (error) {
    next(error);
  }
};
