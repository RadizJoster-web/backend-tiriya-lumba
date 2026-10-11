import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import {  z } from 'zod';

const createPackageSchema = z.object({
  locationId: z.string().min(1, { message: 'Kolam tidak boleh kosong' }),
  type: z.string().min(1, { message: 'Type tidak boleh kosong' }),
  price: z.float64().min(1, { message: 'Harga tidak boleh kosong' }),
  meetCount: z.int32().min(1, { message: 'Sesi pertemuan tidak boleh kosong' }),
});

const updatePackageSchema = createPackageSchema.partial();

export const packageController = {
  getPackages: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const packages = await prisma.package.findMany();

      return res.status(200).json({
        success: true,
        data: packages,
      });
    } catch (err) {
      next(err);
    }
  },

  getPackageById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (typeof id !== 'string' || !id) {
        return res.status(400).json({
          success: false,
          message: 'Masukan id yang sesuai',
        });
      }

      const getPackage = await prisma.package.findFirst({
        where: { id },
      });

      if (!getPackage) {
        return res.status(404).json({
          success: false,
          message: 'Package ini tidak ditemukan.',
        });
      }

      return res.status(200).json({
        success: true,
        data: { package: getPackage }, // Biarr return nya 'package' bukana 'get'
      });
    } catch (err) {
      next(err);
    }
  },

  createPackage: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validateData = createPackageSchema.parse(req.body);
      const newPackage = await prisma.package.create({
        data: validateData,
      });

      return res.status(201).json({
        success: true,
        message: 'Package baru berhasil ditambahkan.',
        data: newPackage,
      });
    } catch (err) {
      next(err);
    }
  },

  updatePackage: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (typeof id !== 'string' || !id) {
        return res.status(400).json({
          success: false,
          message: 'Tolong masukan ID yang valid',
        });
      }

      const validateData = updatePackageSchema.parse(req.body);
      const updatePackage = await prisma.package.update({
        where: { id },
        data: validateData,
      });

      return res.status(200).json({
        success: true,
        message: 'Data package berhasil diperbarui.',
        data: updatePackage,
      });
    } catch (err) {
      next(err);
    }
  },

  deletePackage: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (typeof id !== 'string' || !id) {
        return res.status(400).json({
          success: false,
          message: 'Tolong masukan ID yang valid',
        });
      }

      await prisma.package.delete({
        where: { id },
      });

      return res.status(200).json({
        success: true,
        message: 'Package kolam berhasil dihapus.',
      });
    } catch (error) {
      next(error);
    }
  },
};
