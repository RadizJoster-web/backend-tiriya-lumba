import { Request, Response, NextFunction } from 'express';
import { submitAttendanceService } from '../../services/attendanceService/submit';

export const submitAttendanceController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUser = (req as any).user;
    await submitAttendanceService(req.body, currentUser);
    return res.status(200).json({
      success: true,
      message: 'Absensi hari ini berhasil disimpan.',
    });
  } catch (error) {
    next(error);
  }
};
