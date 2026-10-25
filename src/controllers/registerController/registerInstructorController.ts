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

    // 3. Cek status user dan riwayat pendaftaran instruktur
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        instructorProfile: true,
        registrations: {
          where: { type: 'NEW_INSTRUCTOR' },
          orderBy: { id: 'desc' },
          take: 1,
        },
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan.',
      });
    }

    // Jika user sudah berstatus instruktur aktif
    if (existingUser.role === 'INSTRUCTOR') {
      return res.status(400).json({
        success: false,
        message: 'Anda sudah terdaftar sebagai instruktur aktif.',
      });
    }

    // Jika pendaftaran instruktur masih PENDING
    const latestInstructorReg = existingUser.registrations?.[0];
    if (latestInstructorReg && latestInstructorReg.status === 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Pendaftaran instruktur Anda sedang diproses dan menunggu verifikasi admin.',
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

      // B. Upsert InstructorProfile & Relasikan ke Lokasi-Lokasi Unik
      const instructorProfile = await tx.instructorProfile.upsert({
        where: { userId },
        create: {
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
        update: {
          shortBio: data.shortBio,
          birthDate: new Date(data.birthDate),
          license: data.license,
          experience: data.experience,
          locations: {
            set: uniqueLocationIds.map((id) => ({ id })),
          },
        },
      });

      // C. Simpan Seluruh Deklarasi Ketersediaan Jadwal Mengajar Pelatih
      // Hapus deklarasi jadwal mengajar lama yang belum memiliki murid
      await tx.schedule.deleteMany({
        where: {
          instructorId: userId,
          studentId: null,
        },
      });

      await tx.schedule.createMany({
        data: data.schedules.map((schedule) => ({
          instructorId: userId,
          locationId: schedule.locationId,
          dayOfWeek: schedule.dayOfWeek,
          sessionName: schedule.sessionName,
          studentId: null,
        })),
      });

      // D. Buat Record Pendaftaran baru atau perbarui pendaftaran lama yang berstatus REJECTED
      let registration;
      if (latestInstructorReg && latestInstructorReg.status === 'REJECTED') {
        registration = await tx.registration.update({
          where: { id: latestInstructorReg.id },
          data: {
            status: 'PENDING',
            rejectionReason: null,
            cvUrl: data.cvUrl,
          },
        });
      } else {
        registration = await tx.registration.create({
          data: {
            userId,
            type: 'NEW_INSTRUCTOR',
            status: 'PENDING',
            cvUrl: data.cvUrl,
          },
        });
      }

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
