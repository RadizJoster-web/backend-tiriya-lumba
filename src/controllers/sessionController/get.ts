import { Request, Response, NextFunction } from 'express';
import { getSessionsService } from '../../services/sessionService/get';

export const getSessions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sessions = await getSessionsService(req.query);
    return res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};
