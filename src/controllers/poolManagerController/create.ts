import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../../config/prisma';
import { createPoolManagerSchema } from './poolManagerSchema';

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

export const createPoolManager = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = createPoolManagerSchema.parse(req.body);

    // Cek apakah email sudah terdaftar
    const existingEmail = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar.',
      });
    }

    // Cek lokasi kolam renang
    const locationExists = await prisma.location.findUnique({
      where: { id: validatedData.locationId },
    });

    if (!locationExists) {
      return res.status(404).json({
        success: false,
        message: 'Lokasi kolam renang tidak ditemukan.',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Save User Pool Manager
    const newManager = await prisma.user.create({
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

    return res.status(201).json({
      success: true,
      message: 'Manager kolam renang berhasil ditambahkan.',
      data: newManager,
    });
  } catch (error) {
    next(error);
  }
};
