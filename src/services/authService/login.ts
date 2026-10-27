import bcrypt from 'bcrypt';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { generateAccessToken } from '../../utils/jwt';
import { loginSchema } from './authSchema';

export const loginService = async (body: unknown) => {
  const { email, password } = loginSchema.parse(body);

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      password: true,
      isVerified: true,
      isActive: true,
      locationId: true,
      location: {
        select: {
          id: true,
          name: true,
        },
      },
      profilePictureUrl: true,
    },
  });

  if (!user) {
    throw new AppError(401, 'Email atau password yang Anda masukkan salah.');
  }

  if (!user.isVerified) {
    throw new AppError(
      403,
      'Akun Anda belum diverifikasi. Silakan verifikasi kode OTP terlebih dahulu.',
    );
  }

  if (!user.isActive) {
    throw new AppError(
      403,
      'Akun Anda telah dinonaktifkan. Silakan hubungi admin.',
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError(401, 'Email atau password yang Anda masukkan salah.');
  }

  const tokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    ...(user.role === 'POOL_MANAGER' ? { locationId: user.locationId } : {}),
  };

  const accessToken = generateAccessToken(tokenPayload);

  const userResponse = {
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    profilePictureUrl: user.profilePictureUrl ?? null,
    ...(user.role === 'POOL_MANAGER'
      ? {
          locationId: user.locationId,
          locationName: user.location?.name ?? null,
        }
      : {}),
  };

  return {
    accessToken,
    user: userResponse,
  };
};
