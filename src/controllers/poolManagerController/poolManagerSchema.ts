// src/schemas/poolManagerSchema.ts
import { z } from 'zod';

export const createPoolManagerSchema = z.object({
  fullName: z
    .string({ message: 'Nama lengkap wajib diisi' })
    .min(2, { message: 'Nama lengkap minimal 2 karakter' }),
  email: z
    .string({ message: 'Email wajib diisi' })
    .email({ message: 'Format email tidak valid' }),
  password: z
    .string({ message: 'Password wajib diisi' })
    .min(6, { message: 'Password minimal 6 karakter' }),
  phone: z
    .string({ message: 'No. telepon wajib diisi' })
    .min(10, { message: 'No. telepon minimal 10 digit' })
    .max(15, { message: 'No. telepon maksimal 15 digit' }),
  locationId: z
    .string({ message: 'Location ID wajib diisi' })
    .uuid({ message: 'Format Location ID harus berupa UUID' }),
  isActive: z.boolean().optional().default(true),
});

export const updatePoolManagerSchema = createPoolManagerSchema.partial();

export const paramIdSchema = z.object({
  id: z.string().uuid({ message: 'Format ID Pool Manager tidak valid' }),
});
