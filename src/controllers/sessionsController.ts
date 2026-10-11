import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { z } from 'zod';

export const createSessionSchema = z.object({
  name: z.string().min(3, { message: 'Nama sesi minimal 3 karakter' }), // Contoh: "Sesi Pagi 1"
  dayOfWeek: z.string().min(1, {message: "Hari harus diisi"}),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Format jam mulai harus HH:mm (contoh: 08:00)',
  }),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Format jam selesai harus HH:mm (contoh: 09:30)',
  }),
  locationId: z.string().uuid({ message: 'Location ID harus berupa UUID yang valid' }),
});

const updateSessionSchema = createSessionSchema.partial();

export const sessionsController = {
    getSessions: async (req: Request, res: Response, next: NextFunction) => {
        
    }
}