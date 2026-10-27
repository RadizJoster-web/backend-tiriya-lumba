import { Request, Response, NextFunction } from 'express';
import { registerStudentService } from '../../services/registerService/registerStudent';

export const registerStudentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.userId;
    const result = await registerStudentService(userId, req.body);

    return res.status(201).json({
      success: true,
      message:
        'Pendaftaran berhasil disimpan. Menunggu verifikasi pembayaran oleh admin.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
