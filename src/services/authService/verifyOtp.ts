import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { verifyOtpSchema } from './authSchema';

export const verifyOtpService = async (body: unknown) => {
  const { email, otpCode } = verifyOtpSchema.parse(body);

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      isVerified: true,
      otpCode: true,
      otpExpiresAt: true,
    },
  });

  if (!user) {
    throw new AppError(404, 'Pengguna dengan email ini tidak ditemukan.');
  }

  if (user.isVerified) {
    throw new AppError(
      400,
      'Akun ini sudah diverifikasi sebelumnya. Silakan login.',
    );
  }

  if (user.otpCode !== otpCode) {
    throw new AppError(400, 'Kode OTP yang Anda masukkan salah.');
  }

  if (user.otpExpiresAt && new Date() > user.otpExpiresAt) {
    throw new AppError(
      400,
      'Kode OTP telah kedaluwarsa. Silakan minta kode OTP baru.',
    );
  }

  await prisma.user.update({
    where: { email },
    data: {
      isVerified: true,
      otpCode: null,
      otpExpiresAt: null,
    },
  });

  return true;
};
