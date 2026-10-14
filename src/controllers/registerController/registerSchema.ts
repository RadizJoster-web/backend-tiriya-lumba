// src/schemas/registrationSchema.ts
import { z } from 'zod';

export const registerStudentSchema = z.object({
  // Data Diri Siswa (Step 1)
  profilePictureUrl: z.string().optional().nullable(), // Berisi string filename dari API upload terpisah
  fullName: z.string({ message: 'Nama murid wajib diisi' }),
  birthPlace: z.string({ message: 'Tempat lahir wajib diisi' }),
  birthDate: z.string({ message: 'Tanggal lahir wajib diisi' }), // format: YYYY-MM-DD
  gender: z.string({ message: 'Jenis kelamin wajib diisi' }),
  address: z.string({ message: 'Alamat wajib diisi' }),
  phone: z.string({ message: 'No telepon wajib diisi' }),
  email: z
    .string({ message: 'Email wajib diisi' })
    .email('Format email tidak valid'),
  schoolOrOffice: z.string({
    message: 'Sekolah atau kantor wajib diisi',
  }),
  tshirtSize: z.string({ message: 'Ukuran baju wajib diisi' }),

  // Data Kolam & Kelas (Step 2)
  locationId: z.string({ message: 'Lokasi wajib diisi' }).uuid(),
  packageId: z.string({ message: 'Paket wajib diisi' }).uuid(),
  firstMeetDate: z.string({
    message: 'Tanggal mulai kelas wajib diisi',
  }),
  firstMeetSession: z.string({ message: 'Sesi wajib diisi' }),
  instructorId: z.string({ message: 'Instruktur wajib diisi' }).uuid(),

  // Data Pembayaran (Step 3)
  paymentMethod: z.enum(['QRIS', 'BANK_TRANSFER', 'CASH'], {
    message: 'Metode pembayaran wajib diisi',
  }),
  paymentProofUrl: z.string({ message: 'Bukti pembayaran wajib diisi' }), // Berisi string filename
});
