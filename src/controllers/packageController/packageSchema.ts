import { z } from 'zod';

export const createPackageSchema = z.object({
  locationId: z.string().min(1, { message: 'Kolam tidak boleh kosong' }),
  type: z.string().min(1, { message: 'Type tidak boleh kosong' }),
  price: z.float64().min(1, { message: 'Harga tidak boleh kosong' }),
  meetCount: z.int32().min(1, { message: 'Sesi pertemuan tidak boleh kosong' }),
});

export const packageIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Format ID lokasi tidak valid' }),
});

export const updatePackageSchema = createPackageSchema.partial();
