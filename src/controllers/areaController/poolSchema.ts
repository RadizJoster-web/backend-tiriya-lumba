import { z } from 'zod';

export const createAreaSchema = z.object({
  name: z
    .string({ message: 'Nama area/daerah wajib diisi' })
    .min(2, { message: 'Nama area minimal 2 karakter' })
    .max(50, { message: 'Nama area maksimal 50 karakter' }),
});

export const areaIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Format ID lokasi tidak valid' }),
});

export const updateAreaSchema = createAreaSchema.partial();
