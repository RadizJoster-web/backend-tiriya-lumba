import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { registerInstructorSchema } from './registerSchema';

export const registerInstructorController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Validasi JSON Payload dari Request
    const data = registerInstructorSchema.parse(req.body);

    // 2. Ambil User ID dari Token JWT
    const userId = (req as any).user.userId;

    // 3. Cek apakah user sudah terdaftar sebagai instruktur
    const existingInstructorProfile = await prisma.instructorProfile.findUnique(
      {
        where: { userId },
      },
    );

    if (existingInstructorProfile) {
      return res.status(400).json({
        success: false,
        message: 'Anda sudah mendaftar sebagai instruktur.',
      });
    }

    // 4. Ekstrak seluruh locationId unik dari pilihan jadwal
    const uniqueLocationIds = Array.from(
      new Set(data.schedules.map((s) => s.locationId)),
    );

    // 5. Validasi Keberadaan Lokasi Kolam
    const validLocations = await prisma.location.findMany({
      where: { id: { in: uniqueLocationIds } },
      select: { id: true },
    });

    if (validLocations.length !== uniqueLocationIds.length) {
      return res.status(404).json({
        success: false,
        message:
          'Salah satu atau lebih lokasi kolam yang dipilih tidak ditemukan.',
      });
    }

    // 6. Jalankan Database Transaction (Atomic)
    const result = await prisma.$transaction(async (tx) => {
      // A. Update User Data (Nama, No HP, Foto Profil)
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          fullName: data.fullName,
          phone: data.phone,
          profilePictureUrl: data.profilePictureUrl || null,
        },
      });

      // B. Buat InstructorProfile & Relasikan ke Lokasi-Lokasi Unik
      const instructorProfile = await tx.instructorProfile.create({
        data: {
          user: {
            connect: { id: userId },
          },
          shortBio: data.shortBio,
          birthDate: new Date(data.birthDate),
          license: data.license,
          experience: data.experience,
          locations: {
            connect: uniqueLocationIds.map((id) => ({ id })),
          },
        },
      });

      // C. Simpan Seluruh Deklarasi Ketersediaan Jadwal Mengajar Pelatih
      // studentId diisi null karena baru berupa deklarasi ketersediaan
      await tx.schedule.createMany({
        data: data.schedules.map((schedule) => ({
          instructorId: userId,
          locationId: schedule.locationId,
          dayOfWeek: schedule.dayOfWeek,
          sessionName: schedule.sessionName,
          studentId: null,
        })),
      });

      // D. Buat Record Pendaftaran / Booking (Status: PENDING)
      const registration = await tx.registration.create({
        data: {
          userId,
          type: 'NEW_INSTRUCTOR',
          status: 'PENDING',
          cvUrl: data.cvUrl,
        },
      });

      return { user: updatedUser, instructorProfile, registration };
    });

    // 7. Response Berhasil
    return res.status(201).json({
      success: true,
      message:
        'Pendaftaran instruktur dan deklarasi jadwal berhasil disimpan. Menunggu verifikasi admin.',
      data: {
        registrationId: result.registration.id,
        fullName: result.user.fullName,
        phone: result.user.phone,
        totalSchedulesCreated: data.schedules.length,
        status: result.registration.status,
      },
    });
  } catch (error) {
    next(error);
  }
};
