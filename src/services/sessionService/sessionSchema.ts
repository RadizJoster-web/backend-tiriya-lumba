import { z } from 'zod';

export const createSessionSchema = z.object({
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

export const getSessionFilterSchema = z.object({
  locationId: z
    .string({ message: 'Location ID wajib diisi' })
    .uuid({ message: 'Format Location ID harus berupa UUID' }),
  dayOfWeek: z
    .string({ message: 'Hari wajib diisi' })
    .min(1, { message: 'Hari tidak boleh kosong' }),
});

export const updateSessionSchema = createSessionSchema.partial();
export const paramIdSchema = z.object({
  id: z.string().uuid({ message: 'Format ID sesi tidak valid' }),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type GetSessionFilterInput = z.infer<typeof getSessionFilterSchema>;
