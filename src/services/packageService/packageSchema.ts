import { z } from 'zod';

export const createPackageSchema = z.object({
  locationId: z.string().min(1, { message: 'Kolam tidak boleh kosong' }),
  type: z.string().min(1, { message: 'Type tidak boleh kosong' }),
  price: z.number().min(1, { message: 'Harga tidak boleh kosong' }),
  sessionCount: z
    .number()
    .int({ message: 'Jumlah sesi harus berupa bilangan bulat' })
    .min(1, { message: 'Minimal 1 pertemuan' })
    .max(10, { message: 'Maksimal 10 pertemuan' })
    .default(4)
    .optional(),
});

export const packageIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Format ID lokasi tidak valid' }),
});

export const updatePackageSchema = createPackageSchema.partial();

export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;
