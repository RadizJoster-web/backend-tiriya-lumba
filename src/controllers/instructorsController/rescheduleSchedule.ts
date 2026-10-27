import { Request, Response, NextFunction } from 'express';
import { rescheduleScheduleService } from '../../services/instructorsService/rescheduleSchedule';

export const rescheduleScheduleController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.userId;
    await rescheduleScheduleService(userId, req.body);

    return res.status(200).json({
      success: true,
      message:
        'Jadwal mengajar berhasil diperbarui. Token kesempatan reschedule Anda telah digunakan untuk bulan ini.',
    });
  } catch (error) {
    next(error);
  }
};
