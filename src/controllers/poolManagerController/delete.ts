import { Request, Response, NextFunction } from 'express';
import { deletePoolManagerService } from '../../services/poolManagerService/delete';

export const deletePoolManager = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await deletePoolManagerService(req.params);
    return res.status(200).json({
      success: true,
      message: 'Manager kolam renang berhasil dihapus.',
    });
  } catch (error) {
    next(error);
  }
};
