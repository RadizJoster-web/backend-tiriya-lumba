import { Request, Response, NextFunction } from 'express';
import { getSessionByIdService } from '../../services/sessionService/getById';

export const getSessionById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const session = await getSessionByIdService(req.params);
    return res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};
