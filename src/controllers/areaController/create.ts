import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { createAreaSchema } from './poolSchema';

export const createArea = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name } = createAreaSchema.parse(req.body);

    // Cek apakah nama area sudah ada di database
    const existingArea = await prisma.area.findUnique({
      where: { name },
    });

    if (existingArea) {
      return res.status(400).json({
        success: false,
        message: 'Nama area/daerah sudah terdaftar.',
      });
    }

    const newArea = await prisma.area.create({
      data: { name },
    });

    return res.status(201).json({
      success: true,
      message: 'Area baru berhasil ditambahkan.',
      data: newArea,
    });
  } catch (error) {
    next(error);
  }
};
