import bcrypt from 'bcrypt';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { resetPasswordSchema } from './authSchema';
import { hashToken } from '../../utils/cryptoHelper';

export const resetPasswordService = async (body: unknown) => {
  const { token, newPassword } = resetPasswordSchema.parse(body);

  const hashedToken = hashToken(token);

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ resetToken: hashedToken }, { resetToken: token }],
    },
  });

  if (!user || !user.resetTokenExpiresAt) {
    throw new AppError(
      400,
      'Tautan reset kata sandi tidak valid atau tidak ditemukan. Silakan ajukan permohonan baru.',
    );
  }

  if (new Date() > user.resetTokenExpiresAt) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: null,
        resetTokenExpiresAt: null,
      },
    });

    throw new AppError(
      400,
      'Tautan reset kata sandi telah kedaluwarsa (berlaku 15 menit). Silakan ajukan permohonan reset kata sandi kembali.',
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiresAt: null,
    },
  });

  return true;
};
