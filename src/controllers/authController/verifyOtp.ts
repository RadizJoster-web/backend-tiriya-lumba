import { Request, Response, NextFunction } from 'express';
import { verifyOtpService } from '../../services/authService/verifyOtp';

export const verifyOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await verifyOtpService(req.body);
    return res.status(201).json({
      success: true,
      message: 'Verifikasi akun berhasil! Silakan login.',
    });
  } catch (error) {
    next(error);
  }
};
