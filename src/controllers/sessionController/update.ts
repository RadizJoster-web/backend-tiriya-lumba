import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { paramIdSchema, updateSessionSchema } from './sessionSchema';

export const updateSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = paramIdSchema.parse(req.params);
    const validatedData = updateSessionSchema.parse(req.body);

    const existingSession = await prisma.sessionTime.findUnique({
      where: { id },
    });

    if (!existingSession) {
      return res.status(404).json({
        success: false,
        message: 'Sesi tidak ditemukan.',
      });
    }

    const updatedSession = await prisma.sessionTime.update({
      where: { id },
      data: validatedData,
    });

    return res.status(200).json({
      success: true,
      message: 'Data sesi berhasil diperbarui.',
      data: updatedSession,
    });
  } catch (error) {
    next(error);
  }
};
