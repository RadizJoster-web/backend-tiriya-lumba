import { Request, Response, NextFunction } from 'express';
import { updateSessionService } from '../../services/sessionService/update';

export const updateSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const updatedSession = await updateSessionService(req.params, req.body);
    return res.status(200).json({
      success: true,
      message: 'Data sesi berhasil diperbarui.',
      data: updatedSession,
    });
  } catch (error) {
    next(error);
  }
};
