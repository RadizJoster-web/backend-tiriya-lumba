import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { paramIdSchema } from './poolManagerSchema';

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

export const getPoolManagerById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = paramIdSchema.parse(req.params);

    const manager = await prisma.user.findFirst({
      where: { id, role: 'POOL_MANAGER' },
      select: userSelectWithoutPassword,
    });

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: 'Manager kolam renang tidak ditemukan.',
      });
    }

    return res.status(200).json({
      success: true,
      data: manager,
    });
  } catch (error) {
    next(error);
  }
};
