import { Request, Response, NextFunction } from 'express';
import { registerService } from '../../services/authService/register';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await registerService(req.body);
    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil! Kode OTP telah dikirim ke email Anda.',
      data: data.email,
    });
  } catch (error) {
    next(error);
  }
};
