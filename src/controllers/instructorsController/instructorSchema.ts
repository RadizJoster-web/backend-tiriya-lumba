// src/schemas/instructorSchema.ts
import { z } from 'zod';

export const getAvailableInstructorsQuerySchema = z.object({
  locationId: z
    .string({ message: 'Location ID wajib diisi' })
    .uuid({ message: 'Format Location ID harus berupa UUID' }),
  dayOfWeek: z
    .string({ message: 'Hari wajib diisi' })
    .min(1, { message: 'Hari tidak boleh kosong' }),
  sessionName: z
    .string({ message: 'Nama sesi wajib diisi' })
    .min(1, { message: 'Nama sesi tidak boleh kosong' }),
  packageType: z
    .enum(['REGULER', 'PRIVAT'], {
      message: 'Tipe paket harus REGULER atau PRIVAT',
    })
    .optional()
    .default('REGULER'),
});

export const getInstructorsPaginationSchema = z.object({
  page: z.coerce
    .number({ message: 'Page harus berupa angka' })
    .min(1, { message: 'Page minimal 1' })
    .optional()
    .default(1),
  limit: z.coerce
    .number({ message: 'Limit harus berupa angka' })
    .min(1, { message: 'Limit minimal 1' })
    .max(100, { message: 'Limit maksimal 100' })
    .optional()
    .default(10),
});

export const instructorIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Format ID instruktur tidak valid' }),
});
