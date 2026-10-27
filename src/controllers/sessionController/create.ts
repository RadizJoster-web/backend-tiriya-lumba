import { Request, Response, NextFunction } from 'express';
import { createSessionService } from '../../services/sessionService/create';

export const createSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const newSession = await createSessionService(req.body);
    return res.status(201).json({
      success: true,
      message: 'Sesi baru berhasil ditambahkan.',
      data: newSession,
    });
  } catch (error) {
    next(error);
  }
};
