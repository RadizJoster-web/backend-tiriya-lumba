import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { prisma } from '../../config/prisma';

const resetPasswordSchema = z.object({
  token: z.string().min(10, { message: 'Token reset kata sandi tidak valid' }),
  newPassword: z
    .string()
    .min(6, { message: 'Password minimal 6 karakter' })
    .max(30, { message: 'Password maksimal 30 karakter' }),
});

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
      },
    });

    if (!user || !user.resetTokenExpiresAt) {
      return res.status(400).json({
        success: false,
        message:
          'Tautan reset kata sandi tidak valid atau tidak ditemukan. Silakan ajukan permohonan baru.',
      });
    }

    if (new Date() > user.resetTokenExpiresAt) {
      // Token kedaluwarsa
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: null,
          resetTokenExpiresAt: null,
        },
      });

      return res.status(400).json({
        success: false,
        message:
          'Tautan reset kata sandi telah kedaluwarsa (berlaku 15 menit). Silakan ajukan permohonan reset kata sandi kembali.',
      });
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

    return res.status(200).json({
      success: true,
      message:
        'Kata sandi Anda berhasil diperbarui. Silakan login kembali dengan kata sandi baru Anda.',
    });
  } catch (error) {
    next(error);
  }
};
