import crypto from 'crypto';
import { prisma } from '../../config/prisma';
import { sendResetPasswordEmail } from '../../utils/sendEmail';
import { forgotPasswordSchema } from './authSchema';

export const forgotPasswordService = async (body: unknown) => {
  const { email } = forgotPasswordSchema.parse(body);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return {
      message:
        'Jika email Anda terdaftar di sistem kami, tautan reset kata sandi telah dikirim ke email Anda.',
    };
  }

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

  return {
    message:
      'Tautan reset kata sandi telah berhasil dikirim ke email Anda. Silakan periksa kotak masuk atau spam.',
  };
};
