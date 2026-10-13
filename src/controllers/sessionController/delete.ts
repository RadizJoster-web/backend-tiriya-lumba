import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { paramIdSchema } from './sessionSchema';

export const deleteSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = paramIdSchema.parse(req.params);

    const existingSession = await prisma.sessionTime.findUnique({
      where: { id },
    });

    if (!existingSession) {
      return res.status(404).json({
        success: false,
        message: 'Sesi tidak ditemukan.',
      });
    }

    await prisma.sessionTime.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'Sesi berhasil dihapus.',
    });
  } catch (error) {
    next(error);
  }
};
