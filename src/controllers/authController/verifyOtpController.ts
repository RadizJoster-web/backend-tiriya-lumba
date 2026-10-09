import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const verifyOtpSchema = z.object({
  email: z.string().email({ message: 'Format email tidak valid' }),
  otpCode: z
    .string()
    .length(6, { message: 'Kode OTP harus berupa 6 digit angka' }),
});

export const verifyOtpController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otpCode } = verifyOtpSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna dengan email ini tidak ditemukan.',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Akun ini sudah diverifikasi sebelumnya. Silakan login.',
      });
    }

    if (user.otpCode !== otpCode) {
      return res.status(400).json({
        success: false,
        message: 'Kode OTP yang Anda masukkan salah.',
      });
    }

    // 5. Cek Masa Kedaluwarsa OTP
    if (user.otpExpiresAt && new Date() > user.otpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Kode OTP telah kedaluwarsa. Silakan minta kode OTP baru.',
      });
    }

    await prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        otpCode: null,
        otpExpiresAt: null,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Verifikasi akun berhasil! Silakan login.',
    });
  } catch (error) {
    next(error);
  }
};
