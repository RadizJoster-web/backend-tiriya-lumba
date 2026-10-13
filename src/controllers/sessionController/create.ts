import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { createSessionSchema } from './sessionSchema';

export const createSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = createSessionSchema.parse(req.body);

    const newSession = await prisma.sessionTime.create({
      data: validatedData,
    });

    return res.status(201).json({
      success: true,
      message: 'Sesi baru berhasil ditambahkan.',
      data: newSession,
    });
  } catch (error) {
    next(error);
  }
};
