import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000; // 30 hari (1 bulan)

const rescheduleInputSchema = z.object({
  schedules: z
    .array(
      z.object({
        locationId: z.string({ message: 'ID Lokasi wajib diisi' }).uuid(),
        dayOfWeek: z.string({ message: 'Hari mengajar wajib diisi' }),
        sessionName: z.string({ message: 'Nama sesi wajib diisi' }),
      }),
    )
    .min(1, {
      message:
        'Guru tidak boleh menghapus semua jadwal, minimal harus ada 1 sesi jadwal mengajar.',
    }),
});

/**
 * Mengambil status ketersediaan token reschedule dan jadwal aktif pelatih saat ini
 */
export const getRescheduleStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        instructorProfile: {
          include: { locations: true },
        },
        schedules: {
          include: { location: true },
        },
      },
    });

    if (!user || user.role !== 'INSTRUCTOR' || !user.instructorProfile) {
      return res.status(403).json({
        success: false,
        message: 'Akses khusus pelatih aktif Tirya Lumba.',
      });
    }

    const lastTime = user.instructorProfile.lastRescheduledAt
      ? new Date(user.instructorProfile.lastRescheduledAt).getTime()
      : null;
    const now = Date.now();

    const canReschedule = !lastTime || now - lastTime >= ONE_MONTH_MS;
    const nextAvailableAt =
      !canReschedule && lastTime
        ? new Date(lastTime + ONE_MONTH_MS).toISOString()
        : null;
    const remainingTokens = canReschedule ? 1 : 0;

    const schedules = user.schedules.map((s) => ({
      id: s.id,
      locationId: s.locationId,
      locationName: s.location?.name ?? 'Kolam',
      dayOfWeek: s.dayOfWeek,
      sessionName: s.sessionName,
      hasStudent: Boolean(s.studentId),
      slotKey: `${s.locationId}|${s.dayOfWeek}|${s.sessionName}`,
    }));

    const currentSlots = schedules.map((s) => s.slotKey);
    const currentLocationIds = Array.from(
      new Set(schedules.map((s) => s.locationId)),
    );

    return res.status(200).json({
      success: true,
      data: {
        canReschedule,
        remainingTokens,
        lastRescheduledAt: user.instructorProfile.lastRescheduledAt,
        nextAvailableAt,
        currentLocationIds,
        currentSlots,
        schedules,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mengeksekusi reschedule deklarasi jadwal mengajar pelatih
 */
export const rescheduleScheduleController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        instructorProfile: {
          include: { locations: true },
        },
        schedules: {
          include: { location: true },
        },
      },
    });

    if (!user || user.role !== 'INSTRUCTOR' || !user.instructorProfile) {
      return res.status(403).json({
        success: false,
        message: 'Akses khusus pelatih aktif Tirya Lumba.',
      });
    }

    // 1. Cek Token Reschedule Bulanan (1 kali per bulan)
    const lastTime = user.instructorProfile.lastRescheduledAt
      ? new Date(user.instructorProfile.lastRescheduledAt).getTime()
      : null;
    const now = Date.now();

    if (lastTime && now - lastTime < ONE_MONTH_MS) {
      const resetDate = new Date(lastTime + ONE_MONTH_MS).toLocaleDateString(
        'id-ID',
        {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        },
      );
      return res.status(400).json({
        success: false,
        message: `Kesempatan atur ulang jadwal bulan ini sudah digunakan. Kesempatan berikutnya akan tersedia pada tanggal ${resetDate}.`,
      });
    }

    // 2. Validasi payload data jadwal
    const { schedules: newSchedules } = rescheduleInputSchema.parse(req.body);

    // 3. Validasi: Jangan izinkan pelatih menghapus jadwal yang sedang mengajar murid aktif
    const activeStudentSchedules = user.schedules.filter(
      (s) => s.studentId !== null,
    );
    for (const activeSchedule of activeStudentSchedules) {
      const isRetained = newSchedules.some(
        (ns) =>
          ns.locationId === activeSchedule.locationId &&
          ns.dayOfWeek.trim().toLowerCase() ===
            activeSchedule.dayOfWeek.trim().toLowerCase() &&
          ns.sessionName.trim().toLowerCase() ===
            activeSchedule.sessionName.trim().toLowerCase(),
      );

      if (!isRetained) {
        return res.status(400).json({
          success: false,
          message: `Tidak dapat menghapus sesi ${activeSchedule.dayOfWeek} (${activeSchedule.sessionName}) di ${activeSchedule.location?.name ?? 'Kolam'} karena ada murid yang sedang dijadwalkan pada sesi tersebut.`,
        });
      }
    }

    // 4. Validasi Keberadaan Seluruh Lokasi Kolam yang Dipilih
    const uniqueLocationIds = Array.from(
      new Set(newSchedules.map((s) => s.locationId)),
    );
    const validLocations = await prisma.location.findMany({
      where: { id: { in: uniqueLocationIds } },
      select: { id: true },
    });

    if (validLocations.length !== uniqueLocationIds.length) {
      return res.status(404).json({
        success: false,
        message:
          'Salah satu atau lebih lokasi kolam yang dipilih tidak ditemukan di sistem.',
      });
    }

    // 5. Eksekusi Database Transaction (Atomic)
    await prisma.$transaction(async (tx) => {
      // Hapus deklarasi ketersediaan jadwal pelatih yang belum diisi murid
      await tx.schedule.deleteMany({
        where: {
          instructorId: userId,
          studentId: null,
        },
      });

      // Filter slot yang belum terdaftar sebagai jadwal murid (hindari duplikasi)
      const slotsToCreate = newSchedules.filter((ns) => {
        return !activeStudentSchedules.some(
          (as) =>
            as.locationId === ns.locationId &&
            as.dayOfWeek.trim().toLowerCase() ===
              ns.dayOfWeek.trim().toLowerCase() &&
            as.sessionName.trim().toLowerCase() ===
              ns.sessionName.trim().toLowerCase(),
        );
      });

      if (slotsToCreate.length > 0) {
        await tx.schedule.createMany({
          data: slotsToCreate.map((slot) => ({
            instructorId: userId,
            locationId: slot.locationId,
            dayOfWeek: slot.dayOfWeek,
            sessionName: slot.sessionName,
            studentId: null,
          })),
        });
      }

      // Update lokasi yang diajar dan timestamp reschedule pada profil pelatih
      await tx.instructorProfile.update({
        where: { userId },
        data: {
          lastRescheduledAt: new Date(),
          locations: {
            set: uniqueLocationIds.map((id) => ({ id })),
          },
        },
      });
    });

    return res.status(200).json({
      success: true,
      message:
        'Jadwal mengajar berhasil diperbarui. Token kesempatan reschedule Anda telah digunakan untuk bulan ini.',
    });
  } catch (error) {
    next(error);
  }
};
