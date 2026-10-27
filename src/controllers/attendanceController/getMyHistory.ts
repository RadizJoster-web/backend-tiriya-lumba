import { Request, Response, NextFunction } from 'express';
import { getMyAttendanceHistoryService } from '../../services/attendanceService/getMyHistory';

export const getMyAttendanceHistoryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.userId;
    const data = await getMyAttendanceHistoryService(userId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
