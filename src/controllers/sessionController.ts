import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { z } from 'zod';

const createSessionSchema = z.object({
  sessionName: z
    .string({ message: 'Nama sesi wajib diisi' })
    .min(1, { message: 'Nama sesi tidak boleh kosong (contoh: Sesi 1)' }),
  dayOfWeek: z
    .string({ message: 'Hari wajib diisi' })
    .min(1, { message: 'Hari tidak boleh kosong (contoh: Senin)' }),
  startTime: z
    .string({ message: 'Jam mulai wajib diisi' })
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
      message: 'Format jam mulai harus HH:mm (contoh: 08:00)',
    }),
  endTime: z
    .string({ message: 'Jam selesai wajib diisi' })
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
      message: 'Format jam selesai harus HH:mm (contoh: 09:30)',
    }),
  locationId: z
    .string()
    .uuid({ message: 'Format Location ID harus berupa UUID' })
    .nullable()
    .optional(),
});
const updateSessionSchema = createSessionSchema.partial();
const paramIdSchema = z.object({
  id: z.string().uuid({ message: 'Format ID sesi tidak valid' }),
});

export const sessionController = {
  // 1. Get All Sessions (Filter locationId jika ada, tanpa JOIN ke Location)
  getSessions: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { locationId } = req.query;

      const sessions = await prisma.sessionTime.findMany({
        where: locationId
          ? {
              OR: [
                { locationId: String(locationId) }, // Sesi spesifik kolam
                { locationId: null }, // Sesi global
              ],
            }
          : {},
        orderBy: [{ startTime: 'asc' }],
      });

      return res.status(200).json({
        success: true,
        data: sessions,
      });
    } catch (error) {
      next(error);
    }
  },

  // 2. Get Session By ID
  getSessionById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = paramIdSchema.parse(req.params);

      const session = await prisma.sessionTime.findUnique({
        where: { id },
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Sesi tidak ditemukan.',
        });
      }

      return res.status(200).json({
        success: true,
        data: session,
      });
    } catch (error) {
      next(error);
    }
  },

  // 3. Create Session
  createSession: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = createSessionSchema.parse(req.body);

      const newSession = await prisma.sessionTime.create({
        data: validatedData,
      });

      return res.status(201).json({
        success: true,
        message: 'Sesi baru berhasil ditambahkan.',
        data: newSession,
      });
    } catch (error) {
      next(error);
    }
  },

  // 4. Update Session
  updateSession: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = paramIdSchema.parse(req.params);
      const validatedData = updateSessionSchema.parse(req.body);

      const existingSession = await prisma.sessionTime.findUnique({
        where: { id },
      });

      if (!existingSession) {
        return res.status(404).json({
          success: false,
          message: 'Sesi tidak ditemukan.',
        });
      }

      const updatedSession = await prisma.sessionTime.update({
        where: { id },
        data: validatedData,
      });

      return res.status(200).json({
        success: true,
        message: 'Data sesi berhasil diperbarui.',
        data: updatedSession,
      });
    } catch (error) {
      next(error);
    }
  },

  // 5. Delete Session
  deleteSession: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = paramIdSchema.parse(req.params);

      const existingSession = await prisma.sessionTime.findUnique({
        where: { id },
      });

      if (!existingSession) {
        return res.status(404).json({
          success: false,
          message: 'Sesi tidak ditemukan.',
        });
      }

      await prisma.sessionTime.delete({
        where: { id },
      });

      return res.status(200).json({
        success: true,
        message: 'Sesi berhasil dihapus.',
      });
    } catch (error) {
      next(error);
    }
  },
};
