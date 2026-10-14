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

export const registerInstructorSchema = z.object({
  // Data Identitas Pelatih
  fullName: z
    .string({ message: 'Nama lengkap wajib diisi' })
    .min(2, { message: 'Nama lengkap minimal 2 karakter' }),
  phone: z
    .string({ message: 'No. telepon wajib diisi' })
    .min(10, { message: 'No. telepon minimal 10 digit' }),
  birthDate: z.string({ message: 'Tanggal lahir wajib diisi' }), // Format YYYY-MM-DD
  gender: z.enum(['Laki-Laki', 'Perempuan'], {
    message: 'Jenis kelamin wajib diisi',
  }),
  address: z.string({ message: 'Alamat lengkap wajib diisi' }),

  // Profil Profesional Pelatih
  shortBio: z
    .string({ message: 'Profil singkat wajib diisi' })
    .min(10, { message: 'Profil singkat minimal 10 karakter' }),
  license: z
    .string({ message: 'Lisensi wajib diisi' })
    .min(2, { message: 'Lisensi minimal 2 karakter' }),
  experience: z.string({ message: 'Pengalaman mengajar wajib diisi' }),

  // Fleksibilitas Jadwal Melatih (Lokasi + Hari + Sesi)
  schedules: z
    .array(
      z.object({
        locationId: z.string().uuid({ message: 'Location ID tidak valid' }),
        dayOfWeek: z.string({ message: 'Hari wajib diisi' }),
        sessionName: z.string({ message: 'Nama sesi wajib diisi' }),
      }),
    )
    .min(1, { message: 'Pilih minimal 1 jadwal mengajar' }),

  // File Uploads (String Filename/URL dari Pre-Upload API)
  profilePictureUrl: z.string().optional().nullable(),
  cvUrl: z.string({ message: 'File CV wajib diunggah' }),
});

export type RegisterInstructorInput = z.infer<typeof registerInstructorSchema>;
