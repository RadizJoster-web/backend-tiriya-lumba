import { Request, Response, NextFunction } from 'express';
import { getRescheduleStatusService } from '../../services/instructorsService/getRescheduleStatus';

export const getRescheduleStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.userId;
    const data = await getRescheduleStatusService(userId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
