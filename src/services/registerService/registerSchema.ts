import { z } from 'zod';

export const registerStudentSchema = z.object({
  profilePictureUrl: z.string().optional().nullable(),
  fullName: z.string({ message: 'Nama murid wajib diisi' }),
  birthPlace: z.string({ message: 'Tempat lahir wajib diisi' }),
  birthDate: z.string({ message: 'Tanggal lahir wajib diisi' }),
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

  locationId: z.string({ message: 'Lokasi wajib diisi' }).uuid(),
  packageId: z.string({ message: 'Paket wajib diisi' }).uuid(),
  firstMeetDate: z.string({
    message: 'Tanggal mulai kelas wajib diisi',
  }),
  firstMeetSession: z.string({ message: 'Sesi wajib diisi' }),
  instructorId: z.string({ message: 'Instruktur wajib diisi' }).uuid(),

  paymentMethod: z.enum(['QRIS', 'BANK_TRANSFER', 'CASH'], {
    message: 'Metode pembayaran wajib diisi',
  }),
  paymentProofUrl: z.string({ message: 'Bukti pembayaran wajib diisi' }),
});

export const registerInstructorSchema = z.object({
  fullName: z
    .string({ message: 'Nama lengkap wajib diisi' })
    .min(2, { message: 'Nama lengkap minimal 2 karakter' }),
  phone: z
    .string({ message: 'No. telepon wajib diisi' })
    .min(10, { message: 'No. telepon minimal 10 digit' }),
  birthDate: z.string({ message: 'Tanggal lahir wajib diisi' }),
  gender: z.enum(['Laki-Laki', 'Perempuan'], {
    message: 'Jenis kelamin wajib diisi',
  }),
  address: z.string({ message: 'Alamat lengkap wajib diisi' }),

  shortBio: z
    .string({ message: 'Profil singkat wajib diisi' })
    .min(10, { message: 'Profil singkat minimal 10 karakter' }),
  license: z
    .string({ message: 'Lisensi wajib diisi' })
    .min(2, { message: 'Lisensi minimal 2 karakter' }),
  experience: z.string({ message: 'Pengalaman mengajar wajib diisi' }),

  schedules: z
    .array(
      z.object({
        locationId: z.string().uuid({ message: 'Location ID tidak valid' }),
        dayOfWeek: z.string({ message: 'Hari wajib diisi' }),
        sessionName: z.string({ message: 'Nama sesi wajib diisi' }),
      }),
    )
    .min(1, { message: 'Pilih minimal 1 jadwal mengajar' }),

  profilePictureUrl: z.string().optional().nullable(),
  cvUrl: z.string({ message: 'File CV wajib diunggah' }),
});

export const rejectSchema = z.object({
  rejectionReason: z
    .string({ message: 'Alasan penolakan wajib diisi.' })
    .min(3, { message: 'Alasan penolakan minimal 3 karakter.' }),
});

export type RegisterStudentInput = z.infer<typeof registerStudentSchema>;
export type RegisterInstructorInput = z.infer<typeof registerInstructorSchema>;
export type RejectInput = z.infer<typeof rejectSchema>;
