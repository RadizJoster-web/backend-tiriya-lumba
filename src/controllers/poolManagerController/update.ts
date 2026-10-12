import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../../config/prisma';
import { paramIdSchema, updatePoolManagerSchema } from './poolManagerSchema';

const userSelectWithoutPassword = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  role: true,
  isVerified: true,
  isActive: true,
  locationId: true,
  location: {
    select: {
      name: true,
      area: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
};

export const updatePoolManager = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = paramIdSchema.parse(req.params);
    const validatedData = updatePoolManagerSchema.parse(req.body);

    const currentManager = await prisma.user.findFirst({
      where: { id, role: 'POOL_MANAGER' },
    });

    if (!currentManager) {
      return res.status(404).json({
        success: false,
        message: 'Manager kolam renang tidak ditemukan.',
      });
    }

    // Cek duplikasi email jika ada perubahan email
    if (validatedData.email && validatedData.email !== currentManager.email) {
      const duplicateEmail = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (duplicateEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email sudah digunakan oleh akun lain.',
        });
      }
    }

    // Cek lokasi jika diubah
    if (validatedData.locationId) {
      const locationExists = await prisma.location.findUnique({
        where: { id: validatedData.locationId },
      });

      if (!locationExists) {
        return res.status(404).json({
          success: false,
          message: 'Lokasi kolam renang tujuan tidak ditemukan.',
        });
      }
    }

    const updatePayload: any = {};

    if (validatedData.fullName !== undefined)
      updatePayload.fullName = validatedData.fullName;
    if (validatedData.email !== undefined)
      updatePayload.email = validatedData.email;
    if (validatedData.phone !== undefined)
      updatePayload.phone = validatedData.phone;
    if (validatedData.locationId !== undefined)
      updatePayload.locationId = validatedData.locationId;
    if (validatedData.isActive !== undefined)
      updatePayload.isActive = validatedData.isActive;

    if (validatedData.password) {
      updatePayload.password = await bcrypt.hash(validatedData.password, 10);
    }

    const updatedManager = await prisma.user.update({
      where: { id },
      data: updatePayload,
      select: userSelectWithoutPassword,
    });

    return res.status(200).json({
      success: true,
      message: 'Data manager kolam renang berhasil diperbarui.',
      data: updatedManager,
    });
  } catch (error) {
    next(error);
  }
};
