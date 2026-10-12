import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';

const createAreaSchema = z.object({
  name: z
    .string({ message: 'Nama area/daerah wajib diisi' })
    .min(2, { message: 'Nama area minimal 2 karakter' })
    .max(50, { message: 'Nama area maksimal 50 karakter' }),
});

const areaIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Format ID lokasi tidak valid' }),
});

const updateAreaSchema = createAreaSchema.partial();
// The generated Prisma client may not yet include the Area model.

export const areaController = {
  getAreas: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const areas = await prisma.area.findMany({
        include: {
          _count: {
            select: { locations: true }, // Menampilkan jumlah kolam di area tersebut
          },
        },
        orderBy: { name: 'asc' },
      });

      return res.status(200).json({
        success: true,
        data: areas,
      });
    } catch (error) {
      next(error);
    }
  },

  getAreaById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = areaIdParamSchema.parse(req.params);

      if (typeof id !== 'string' || !id) {
        return res.status(400).json({
          success: false,
          message: 'Tolong masukan ID yang valid',
        });
      }

      const area = await prisma.area.findUnique({
        where: { id },
        include: {
          locations: {
            select: {
              id: true,
              name: true,
              category: true,
              mapUrl: true,
            },
          },
        },
      });

      if (!area) {
        return res.status(404).json({
          success: false,
          message: 'Area/daerah tidak ditemukan.',
        });
      }

      return res.status(200).json({
        success: true,
        data: area,
      });
    } catch (error) {
      next(error);
    }
  },

  createArea: async (req: Request, res: Response, next: NextFunction) => {
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
  },

  updateArea: async (req: Request, res: Response, next: NextFunction) => {
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
  },

  deleteArea: async (req: Request, res: Response, next: NextFunction) => {
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
  },
};
