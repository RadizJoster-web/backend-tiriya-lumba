// src/controllers/authController/loginController.ts
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { prisma } from '../../config/prisma';
import { generateAccessToken } from '../../utils/jwt';

const loginSchema = z.object({
  email: z.string().trim().email({
    message: 'Format email tidak valid.',
  }),
  password: z.string().min(1, { message: 'Password tidak boleh kosong' }),
});

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Validasi Input Payload dengan Zod
    const { email, password } = loginSchema.parse(req.body);

    // Cari User di Database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password yang Anda masukkan salah.',
      });
    }

    // Cek Status Verifikasi OTP
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message:
          'Akun Anda belum diverifikasi. Silakan verifikasi kode OTP terlebih dahulu.',
      });
    }

    // Cek Status Keaktifan Akun (Fitur Tambahan)
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Akun Anda telah dinonaktifkan. Silakan hubungi admin.',
      });
    }

    // Cek Kecocokan Password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password yang Anda masukkan salah.',
      });
    }

    const tokenPayload = {
      userId: user.id,
      role: user.role,
      ...(user.role === 'POOL_MANAGER' ? { locationId: user.locationId } : {}),
    };

    const accessToken = generateAccessToken(tokenPayload);

    const userResponse = {
      userId: user.id,
      email: user.email,
      role: user.role,
      ...(user.role === 'POOL_MANAGER' ? { locationId: user.locationId } : {}),
    };

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    // Kirimkan Respon HTTP beserta Token ke Klien
    return res.status(200).json({
      success: true,
      message: 'Login berhasil!',
      data: {
        token: accessToken,
        user: userResponse,
      },
    });
  } catch (error) {
    next(error);
  }
};
