import { Request, Response, NextFunction } from 'express';
import { getMyRegistrationService } from '../../services/registerService/getMyRegistration';

export const getMyRegistrationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.userId;
    const snapshot = await getMyRegistrationService(userId);

    return res.status(200).json({
      success: true,
      data: snapshot,
    });
  } catch (error) {
    next(error);
  }
};
