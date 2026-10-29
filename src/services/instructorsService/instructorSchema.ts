import { z } from 'zod';

export const getInstructorsPaginationSchema = z.object({
  page: z.coerce
    .number({ message: 'Page harus berupa angka' })
    .min(1, { message: 'Page minimal 1' })
    .default(1),
  limit: z.coerce
    .number({ message: 'Limit harus berupa angka' })
    .min(1, { message: 'Limit minimal 1' })
    .max(100, { message: 'Limit maksimal 100' })
    .default(10),
});

export const getAvailableInstructorsQuerySchema = z.object({
  locationId: z
    .string({ message: 'Location ID wajib diisi' })
    .uuid({ message: 'Format Location ID harus UUID' }),
  dayOfWeek: z.string({ message: 'Hari wajib diisi' }),
  sessionName: z.string({ message: 'Nama sesi wajib diisi' }),
  packageType: z.string().optional(),
});

export const rescheduleInputSchema = z.object({
  schedules: z
    .array(
      z.object({
        locationId: z.string({ message: 'ID Lokasi wajib diisi' }).uuid(),
        dayOfWeek: z.string({ message: 'Hari mengajar wajib diisi' }),
        sessionName: z.string({ message: 'Nama sesi wajib diisi' }),
      }),
    )
    .min(1, {
      message:
        'Guru tidak boleh menghapus semua jadwal, minimal harus ada 1 sesi jadwal mengajar.',
    }),
});

export const paramIdSchema = z.object({
  id: z.string().uuid({ message: 'Format ID tidak valid' }),
});

export type GetInstructorsPaginationInput = z.infer<
  typeof getInstructorsPaginationSchema
>;
export type GetAvailableInstructorsQueryInput = z.infer<
  typeof getAvailableInstructorsQuerySchema
>;
export type RescheduleInput = z.infer<typeof rescheduleInputSchema>;
