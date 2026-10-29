import { z } from 'zod';

export const createLocationSchema = z.object({
  name: z
    .string({ message: 'Nama kolam renang tidak boleh kosong' })
    .trim()
    .min(1, { message: 'Nama kolam renang minimal 1 karakter' })
    .max(100, { message: 'Nama kolam renang maksimal 100 karakter' }),
  areaId: z
    .string({ message: 'Area kolam renang tidak boleh kosong' })
    .trim()
    .min(1)
    .max(100),
  category: z
    .string({ message: 'Kategori tidak boleh kosong' })
    .trim()
    .min(1)
    .max(100),
  mapUrl: z
    .string({
      message: 'Tolong masukan lokasi koordinat sesuai titik di google map',
    })
    .trim()
    .url({ message: 'Format URL Google Maps tidak valid' })
    .max(500, { message: 'URL Google Maps terlalu panjang (maksimal 500 karakter)' })
    .refine((val) => /^https?:\/\//i.test(val), {
      message: 'URL Google Maps harus menggunakan protokol HTTP atau HTTPS',
    }),
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
    .default(8),
});

export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
export type GetPublicLocationsQuery = z.infer<typeof getPublicLocationsQuerySchema>;
