import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z
    .string({ message: 'Nama lengkap wajib diisi' })
    .min(2, { message: 'Nama lengkap minimal 2 karakter' })
    .max(50, { message: 'Nama lengkap maksimal 50 karakter' }),
  email: z
    .string({ message: 'Email wajib diisi' })
    .email({ message: 'Format email tidak valid' }),
  password: z
    .string({ message: 'Password wajib diisi' })
    .min(6, { message: 'Password minimal 6 karakter' })
    .max(30, { message: 'Password maksimal 30 karakter' }),
});

export const loginSchema = z.object({
  email: z.string().trim().email({ message: 'Format email tidak valid.' }),
  password: z.string().min(1, { message: 'Password tidak boleh kosong' }),
});

export const verifyOtpSchema = z.object({
  email: z.string().email({ message: 'Format email tidak valid' }),
  otpCode: z
    .string()
    .length(6, { message: 'Kode OTP harus berupa 6 digit angka' }),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email({ message: 'Format email tidak valid' }),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10, { message: 'Token reset kata sandi tidak valid' }),
  newPassword: z
    .string()
    .min(6, { message: 'Password minimal 6 karakter' })
    .max(30, { message: 'Password maksimal 30 karakter' }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
