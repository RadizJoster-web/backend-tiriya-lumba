import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { success, z } from 'zod';
import { captureRejectionSymbol } from 'node:events';

const createLocationSchema = z.object({
  name: z.string().min(1, { message: 'Nama kolam renang tidak boleh kosong' }),
  address: z.string().min(1, {
    message: 'Tolong masukan alamat lokasi kolam renang',
  }),
  category: z.string().min(1, { message: 'Kategori tidak boleh kosong' }),
  mapUrl: z.string().min(1, {
    message: 'Tolong masukan lokasai koordinat sesuai titik di google map',
  }),
});

const updateLocationSchema = createLocationSchema.partial();

export const locationController = {
  getLocations: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const locations = await prisma.location.findMany({
        orderBy: { name: 'desc' },
      });

      return res.status(200).json({
        success: true,
        data: locations,
      });
    } catch (err) {
      next(err);
    }
  },

  getLocationById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (typeof id !== 'string' || !id) {
        return res.status(400).json({
          success: false,
          message: 'Tolong masukan ID yang valid',
        });
      }

      const location = await prisma.location.findUnique({
        where: { id },
      });

      if (!location) {
        return res.status(404).json({
          success: false,
          message: 'Lokasi kolam tidak ditemukan.',
        });
      }

      return res.status(200).json({
        success: true,
        data: location,
      });
    } catch (err) {
      next(err);
    }
  },

  createLocation: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = createLocationSchema.parse(req.body);
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
  },

  updateLocation: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (typeof id !== 'string' || !id) {
        return res.status(400).json({
          success: false,
          message: 'Tolong masukan ID yang valid',
        });
      }

      const validatedData = updateLocationSchema.parse(req.body);

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
  },

  deleteLocation: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (typeof id !== 'string' || !id) {
        return res.status(400).json({
          success: false,
          message: 'Tolong masukan ID yang valid',
        });
      }

      await prisma.location.delete({
        where: { id },
      });

      return res.status(200).json({
        success: true,
        message: 'Lokasi kolam berhasil dihapus.',
      });
    } catch (error) {
      next(error);
    }
  },
};
