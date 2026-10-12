import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { paramIdSchema } from './poolManagerSchema';

export const deletePoolManager = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = paramIdSchema.parse(req.params);

    const existingManager = await prisma.user.findFirst({
      where: { id, role: 'POOL_MANAGER' },
    });

    if (!existingManager) {
      return res.status(404).json({
        success: false,
        message: 'Manager kolam renang tidak ditemukan.',
      });
    }

    await prisma.user.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'Manager kolam renang berhasil dihapus.',
    });
  } catch (error) {
    next(error);
  }
};