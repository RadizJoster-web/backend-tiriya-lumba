import { Request, Response, NextFunction } from 'express';
import { createPoolManagerService } from '../../services/poolManagerService/create';

export const createPoolManager = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const newManager = await createPoolManagerService(req.body);
    return res.status(201).json({
      success: true,
      message: 'Manager kolam renang berhasil ditambahkan.',
      data: newManager,
    });
  } catch (error) {
    next(error);
  }
};
