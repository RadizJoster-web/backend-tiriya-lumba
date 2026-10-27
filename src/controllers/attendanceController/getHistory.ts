import { Request, Response, NextFunction } from 'express';
import { getAttendanceHistoryService } from '../../services/attendanceService/getHistory';

export const getAttendanceHistoryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getAttendanceHistoryService();
    return res.status(200).json({
      success: true,
      totalItems: result.length,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
