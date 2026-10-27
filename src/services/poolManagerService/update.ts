import bcrypt from 'bcrypt';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import {
  paramIdSchema,
  updatePoolManagerSchema,
  userSelectWithoutPassword,
} from './poolManagerSchema';

export const updatePoolManagerService = async (
  params: unknown,
  body: unknown,
) => {
  const { id } = paramIdSchema.parse(params);
  const validatedData = updatePoolManagerSchema.parse(body);

  const currentManager = await prisma.user.findFirst({
    where: { id, role: 'POOL_MANAGER' },
  });

  if (!currentManager) {
    throw new AppError(404, 'Manager kolam renang tidak ditemukan.');
  }

  if (validatedData.email && validatedData.email !== currentManager.email) {
    const duplicateEmail = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (duplicateEmail) {
      throw new AppError(400, 'Email sudah digunakan oleh akun lain.');
    }
  }

  if (validatedData.locationId) {
    const locationExists = await prisma.location.findUnique({
      where: { id: validatedData.locationId },
    });

    if (!locationExists) {
      throw new AppError(404, 'Lokasi kolam renang tujuan tidak ditemukan.');
    }
  }

  const updatePayload: any = {};
  if (validatedData.fullName !== undefined) updatePayload.fullName = validatedData.fullName;
  if (validatedData.email !== undefined) updatePayload.email = validatedData.email;
  if (validatedData.phone !== undefined) updatePayload.phone = validatedData.phone;
  if (validatedData.locationId !== undefined) updatePayload.locationId = validatedData.locationId;
  if (validatedData.isActive !== undefined) updatePayload.isActive = validatedData.isActive;

  if (validatedData.password) {
    updatePayload.password = await bcrypt.hash(validatedData.password, 10);
  }

  return prisma.user.update({
    where: { id },
    data: updatePayload,
    select: userSelectWithoutPassword,
  });
};
