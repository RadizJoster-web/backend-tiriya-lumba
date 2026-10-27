import { Request, Response, NextFunction } from 'express';
import { getAttendanceTodayService } from '../../services/attendanceService/getToday';

export const getAttendanceTodayController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUser = (req as any).user;
    const locationId = req.query.locationId as string | undefined;

    const result = await getAttendanceTodayService(currentUser, locationId);
    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
