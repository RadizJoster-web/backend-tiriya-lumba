import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { createLocationSchema } from './locationSchema';

export const createLocation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = createLocationSchema.parse(req.body);

    const areaExists = await prisma.area.findUnique({
      where: { id: validatedData.areaId },
    });

    if (!areaExists) {
      return res.status(404).json({
        success: false,
        message: 'Area/daerah tidak ditemukan.',
      });
    }

    const existingLocationnInArea = await prisma.location.findFirst({
      where: {
        areaId: validatedData.areaId,
        name: validatedData.name,
      },
    });

    if (existingLocationnInArea) {
      return res.status(400).json({
        success: false,
        message: `Lokasi kolam "${validatedData.name}" sudah terdaftar di area ini.`,
      });
    }

    const newLocation = await prisma.location.create({
      data: validatedData,
    });

    return res.status(201).json({
      success: true,
      message: 'Lokasi kolam baru berhasil ditambahkan.',
      data: newLocation,
    });
  } catch (err) {
    next(err);
  }
};
