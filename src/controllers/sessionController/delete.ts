import { Request, Response, NextFunction } from 'express';
import { deleteSessionService } from '../../services/sessionService/delete';

export const deleteSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await deleteSessionService(req.params);
    return res.status(200).json({
      success: true,
      message: 'Sesi berhasil dihapus.',
    });
  } catch (error) {
    next(error);
  }
};
