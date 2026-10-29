import { Request, Response, NextFunction } from 'express';
import { getAttendanceHistoryService } from '../../services/attendanceService/getHistory';

export const getAttendanceHistoryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUser = (req as any).user;
    const result = await getAttendanceHistoryService(currentUser);
    return res.status(200).json({
      success: true,
      totalItems: result.length,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
