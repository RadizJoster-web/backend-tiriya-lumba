import { Request, Response, NextFunction } from 'express';
import { resetPasswordService } from '../../services/authService/resetPassword';

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await resetPasswordService(req.body);
    return res.status(200).json({
      success: true,
      message:
        'Kata sandi Anda berhasil diperbarui. Silakan login kembali dengan kata sandi baru Anda.',
    });
  } catch (error) {
    next(error);
  }
};
