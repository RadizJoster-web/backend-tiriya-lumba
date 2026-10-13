import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { paramIdSchema } from './sessionSchema';

export const getSessionById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = paramIdSchema.parse(req.params);

    const session = await prisma.sessionTime.findUnique({
      where: { id },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Sesi tidak ditemukan.',
      });
    }

    return res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};
