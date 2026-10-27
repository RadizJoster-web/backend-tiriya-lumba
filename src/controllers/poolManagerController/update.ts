import { Request, Response, NextFunction } from 'express';
import { updatePoolManagerService } from '../../services/poolManagerService/update';

export const updatePoolManager = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const updatedManager = await updatePoolManagerService(req.params, req.body);
    return res.status(200).json({
      success: true,
      message: 'Data manager kolam renang berhasil diperbarui.',
      data: updatedManager,
    });
  } catch (error) {
    next(error);
  }
};
