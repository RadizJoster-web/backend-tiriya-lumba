import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import { generateOtp } from '../../utils/generateOtp';
import { sendOtpEmail } from '../../utils/sendEmail';

const registerSchema = z.object({
  email: z.string().email({ message: 'Format email tidak valid' }),
  password: z
    .string()
    .min(6, { message: 'Password minimal 6 karakter' })
    .max(12, { message: 'Password maksimal 12 karakter' }),
});

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = req.body;
  try {
    // Memvalidasi req.body secara langsung
    const validatedData = registerSchema.parse({ email, password });

    const otpCode = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        otpCode,
        otpExpiresAt,
        isVerified: false,
      },
      create: {
        email,
        password,
        role: 'STUDENT',
        otpCode,
        otpExpiresAt,
        isVerified: false,
      },
    });

    await sendOtpEmail(email, otpCode);

    res.status(200).json({
      success: true,
      message: 'Registrasi berhasil! Kode OTP telah dikirim ke email Anda.',
      data: email,
    });
  } catch (error) {
    next(error);
  }
};
