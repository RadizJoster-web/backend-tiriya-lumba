import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { verifyOtpSchema } from './authSchema';
import { hashToken, timingSafeMatch } from '../../utils/cryptoHelper';

export const verifyOtpService = async (body: unknown) => {
  const { email, otpCode } = verifyOtpSchema.parse(body);

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
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

  if (!user.otpCode || !user.otpExpiresAt) {
    throw new AppError(
      400,
      'Kode OTP tidak ditemukan atau sudah kadaluwarsa. Silakan minta kode OTP baru.',
    );
  }

  if (new Date() > user.otpExpiresAt) {
    await prisma.user.update({
      where: { email },
      data: { otpCode: null, otpExpiresAt: null },
    });
    throw new AppError(
      400,
      'Kode OTP telah kedaluwarsa. Silakan minta kode OTP baru.',
    );
  }

  const hashedInputOtpSalted = hashToken(otpCode, email);
  const hashedInputOtpLegacy = hashToken(otpCode);
  const isMatch =
    timingSafeMatch(user.otpCode, hashedInputOtpSalted) ||
    timingSafeMatch(user.otpCode, hashedInputOtpLegacy) ||
    timingSafeMatch(user.otpCode, otpCode);

  if (!isMatch) {
    throw new AppError(400, 'Kode OTP yang Anda masukkan salah.');
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
