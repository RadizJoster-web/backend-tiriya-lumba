import bcrypt from 'bcrypt';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import {
  createPoolManagerSchema,
  userSelectWithoutPassword,
} from './poolManagerSchema';

export const createPoolManagerService = async (body: unknown) => {
  const validatedData = createPoolManagerSchema.parse(body);

  const existingEmail = await prisma.user.findUnique({
    where: { email: validatedData.email },
  });

  if (existingEmail) {
    throw new AppError(400, 'Email sudah terdaftar.');
  }

  const locationExists = await prisma.location.findUnique({
    where: { id: validatedData.locationId },
  });

  if (!locationExists) {
    throw new AppError(404, 'Lokasi kolam renang tidak ditemukan.');
  }

  const hashedPassword = await bcrypt.hash(validatedData.password, 10);

  return prisma.user.create({
    data: {
      fullName: validatedData.fullName,
      email: validatedData.email,
      password: hashedPassword,
      phone: validatedData.phone,
      role: 'POOL_MANAGER',
      locationId: validatedData.locationId,
      isVerified: true,
      isActive: validatedData.isActive,
    },
    select: userSelectWithoutPassword,
  });
};
