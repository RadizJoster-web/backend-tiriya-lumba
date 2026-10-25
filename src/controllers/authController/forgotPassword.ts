import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '../../config/prisma';
import { sendResetPasswordEmail } from '../../utils/sendEmail';

const forgotPasswordSchema = z.object({
  email: z.string().trim().email({ message: 'Format email tidak valid' }),
});

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Untuk keamanan tidak memberitahukan apakah email ada atau tidak, tapi tetap responsif
      return res.status(200).json({
        success: true,
        message:
          'Jika email Anda terdaftar di sistem kami, tautan reset kata sandi telah dikirim ke email Anda.',
      });
    }

    // Buat token random aman dan kedaluwarsa 15 menit
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiresAt,
      },
    });

    const landingBaseUrl =
      process.env.URL_LANDING_PAGE || 'http://localhost:3000';
    const cleanLandingUrl = landingBaseUrl.replace(/\/+$/, '');
    const resetUrl = `${cleanLandingUrl}/reset-password?token=${resetToken}`;

    await sendResetPasswordEmail(user.email, resetUrl);

    return res.status(200).json({
      success: true,
      message:
        'Tautan reset kata sandi telah berhasil dikirim ke email Anda. Silakan periksa kotak masuk atau spam.',
    });
  } catch (error) {
    next(error);
  }
};
