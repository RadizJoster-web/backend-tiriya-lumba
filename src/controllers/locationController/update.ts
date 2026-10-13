import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { locationIdParamSchema, updateLocationSchema } from './locationSchema';

export const updateLocation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = locationIdParamSchema.parse(req.params);

    if (typeof id !== 'string' || !id) {
      return res.status(400).json({
        success: false,
        message: 'Tolong masukan ID yang valid',
      });
    }

    const validatedData = updateLocationSchema.parse(req.body);

    if (validatedData.areaId) {
      const areaExists = await prisma.area.findUnique({
        where: { id: validatedData.areaId },
      });
      if (!areaExists) {
        return res.status(404).json({
          success: false,
          message: 'Area/daerah tujuan tidak ditemukan.',
        });
      }
    }

    const updatedLocation = await prisma.location.update({
      where: { id },
      data: validatedData,
    });

    return res.status(200).json({
      success: true,
      message: 'Data lokasi berhasil diperbarui.',
      data: updatedLocation,
    });
  } catch (err) {
    next(err);
  }
};
