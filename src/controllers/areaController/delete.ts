import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { areaIdParamSchema } from './poolSchema';

export const deleteArea = async (
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

    const existingArea = await prisma.area.findUnique({
      where: { id },
      include: {
        _count: {
          select: { locations: true },
        },
      },
    });

    if (!existingArea) {
      return res.status(404).json({
        success: false,
        message: 'Area/daerah tidak ditemukan.',
      });
    }

    // Cegah penghapusan jika area masih digunakan oleh data Location
    if (existingArea._count.locations > 0) {
      return res.status(400).json({
        success: false,
        message:
          'Gagal menghapus. Area ini masih terikat dengan beberapa lokasi kolam renang.',
      });
    }

    await prisma.area.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'Area berhasil dihapus.',
    });
  } catch (error) {
    next(error);
  }
};
