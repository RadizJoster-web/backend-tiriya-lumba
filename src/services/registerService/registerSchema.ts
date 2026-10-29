import { z } from 'zod';

export const registerStudentSchema = z.object({
  profilePictureUrl: z.string().max(500).optional().nullable(),
  fullName: z
    .string({ message: 'Nama murid wajib diisi' })
    .trim()
    .min(2, { message: 'Nama murid minimal 2 karakter' })
    .max(100, { message: 'Nama murid maksimal 100 karakter' }),
  birthPlace: z
    .string({ message: 'Tempat lahir wajib diisi' })
    .trim()
    .min(2)
    .max(100),
  birthDate: z.string({ message: 'Tanggal lahir wajib diisi' }),
  gender: z.string({ message: 'Jenis kelamin wajib diisi' }).max(20),
  address: z
    .string({ message: 'Alamat wajib diisi' })
    .trim()
    .min(5)
    .max(300),
  phone: z
    .string({ message: 'No telepon wajib diisi' })
    .trim()
    .min(8)
    .max(20)
    .regex(/^[0-9+() -]+$/, { message: 'Format nomor telepon tidak valid' }),
  email: z
    .string({ message: 'Email wajib diisi' })
    .trim()
    .email('Format email tidak valid')
    .max(100),
  schoolOrOffice: z
    .string({
      message: 'Sekolah atau kantor wajib diisi',
    })
    .trim()
    .max(150),
  tshirtSize: z.string({ message: 'Ukuran baju wajib diisi' }).max(10),

  locationId: z.string({ message: 'Lokasi wajib diisi' }).uuid(),
  packageId: z.string({ message: 'Paket wajib diisi' }).uuid(),
  firstMeetDate: z.string({
    message: 'Tanggal mulai kelas wajib diisi',
  }),
  firstMeetSession: z.string({ message: 'Sesi wajib diisi' }).max(50),
  instructorId: z.string({ message: 'Instruktur wajib diisi' }).uuid(),

  paymentMethod: z.enum(['QRIS', 'BANK_TRANSFER', 'CASH'], {
    message: 'Metode pembayaran wajib diisi',
  }),
  paymentProofUrl: z.string({ message: 'Bukti pembayaran wajib diisi' }).max(500),
});

export const registerInstructorSchema = z.object({
  fullName: z
    .string({ message: 'Nama lengkap wajib diisi' })
    .trim()
    .min(2, { message: 'Nama lengkap minimal 2 karakter' })
    .max(100, { message: 'Nama lengkap maksimal 100 karakter' }),
  phone: z
    .string({ message: 'No. telepon wajib diisi' })
    .trim()
    .min(10, { message: 'No. telepon minimal 10 digit' })
    .max(20)
    .regex(/^[0-9+() -]+$/, { message: 'Format nomor telepon tidak valid' }),
  birthDate: z.string({ message: 'Tanggal lahir wajib diisi' }),
  gender: z.enum(['Laki-Laki', 'Perempuan'], {
    message: 'Jenis kelamin wajib diisi',
  }),
  address: z
    .string({ message: 'Alamat lengkap wajib diisi' })
    .trim()
    .min(5)
    .max(300),

  shortBio: z
    .string({ message: 'Profil singkat wajib diisi' })
    .trim()
    .min(10, { message: 'Profil singkat minimal 10 karakter' })
    .max(1000),
  license: z
    .string({ message: 'Lisensi wajib diisi' })
    .trim()
    .min(2, { message: 'Lisensi minimal 2 karakter' })
    .max(500),
  experience: z
    .string({ message: 'Pengalaman mengajar wajib diisi' })
    .trim()
    .max(500),

  schedules: z
    .array(
      z.object({
        locationId: z.string().uuid({ message: 'Location ID tidak valid' }),
        dayOfWeek: z.string({ message: 'Hari wajib diisi' }).max(20),
        sessionName: z.string({ message: 'Nama sesi wajib diisi' }).max(50),
      }),
    )
    .min(1, { message: 'Pilih minimal 1 jadwal mengajar' }),

  profilePictureUrl: z.string().max(500).optional().nullable(),
  cvUrl: z.string({ message: 'File CV wajib diunggah' }).max(500),
});

export const rejectSchema = z.object({
  rejectionReason: z
    .string({ message: 'Alasan penolakan wajib diisi.' })
    .trim()
    .min(3, { message: 'Alasan penolakan minimal 3 karakter.' })
    .max(500, { message: 'Alasan penolakan maksimal 500 karakter.' }),
});

export type RegisterStudentInput = z.infer<typeof registerStudentSchema>;
export type RegisterInstructorInput = z.infer<typeof registerInstructorSchema>;
export type RejectInput = z.infer<typeof rejectSchema>;
