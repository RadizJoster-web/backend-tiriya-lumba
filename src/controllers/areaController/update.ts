import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { areaIdParamSchema, updateAreaSchema } from './poolSchema';
import { from } from 'node:stream/iter';

export const updateArea = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = areaIdParamSchema.parse(req.params);
    if (typeof id !== 'string' || !id) {
      return res.status(400).json({
        success: false,
        message: 'Tolong masukan ID yang valid',
      });
    }

    const validatedData = updateAreaSchema.parse(req.body);

    const existingArea = await prisma.area.findUnique({
      where: { id },
    });

    if (!existingArea) {
      return res.status(404).json({
        success: false,
        message: 'Area/daerah tidak ditemukan.',
      });
    }

    // Jika mengubah nama, pastikan tidak bentrok dengan area lain
    if (validatedData.name && validatedData.name !== existingArea.name) {
      const duplicateArea = await prisma.area.findUnique({
        where: { name: validatedData.name },
      });

      if (duplicateArea) {
        return res.status(400).json({
          success: false,
          message: 'Nama area/daerah sudah digunakan.',
        });
      }
    }

    const updatedArea = await prisma.area.update({
      where: { id },
      data: validatedData,
    });

    return res.status(200).json({
      success: true,
      message: 'Data area berhasil diperbarui.',
      data: updatedArea,
    });
  } catch (error) {
    next(error);
  }
};
