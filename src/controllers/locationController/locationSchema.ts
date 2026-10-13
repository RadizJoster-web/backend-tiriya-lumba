import { z } from 'zod';

export const createLocationSchema = z.object({
  name: z.string({ message: 'Nama kolam renang tidak boleh kosong' }).min(1),
  areaId: z.string({ message: 'Area kolam renang tidak boleh kosong' }).min(1),
  category: z.string({ message: 'Kategori tidak boleh kosong' }).min(1),
  mapUrl: z
    .string({
      message: 'Tolong masukan lokasai koordinat sesuai titik di google map',
    })
    .min(1),
});

export const locationIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Format ID lokasi tidak valid' }),
});

export const updateLocationSchema = createLocationSchema.partial();

export const getPublicLocationsQuerySchema = z.object({
  page: z.coerce
    .number({ message: 'Page harus berupa angka' })
    .min(1, { message: 'Page minimal 1' })
    .optional()
    .default(1),
  limit: z.coerce
    .number({ message: 'Limit harus berupa angka' })
    .min(1, { message: 'Limit minimal 1' })
    .max(50, { message: 'Limit maksimal 50' })
    .optional()
    .default(8), // 👈 Default 8 data per page sesuai kebutuhan Landing Page
});
