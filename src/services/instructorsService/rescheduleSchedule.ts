import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { rescheduleInputSchema } from './instructorSchema';
import { ONE_MONTH_MS } from './getRescheduleStatus';
import {
  findActiveStudentSchedules,
  validateRetainedSchedules,
} from './rescheduleGuard';

export const rescheduleScheduleService = async (
  userId: string,
  body: unknown,
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      instructorProfile: { include: { locations: true } },
      schedules: { include: { location: true } },
    },
  });

  if (!user || user.role !== 'INSTRUCTOR' || !user.instructorProfile) {
    throw new AppError(403, 'Akses khusus pelatih aktif Tirya Lumba.');
  }

  const lastTime = user.instructorProfile.lastRescheduledAt
    ? new Date(user.instructorProfile.lastRescheduledAt).getTime()
    : null;
  const now = Date.now();

  if (lastTime && now - lastTime < ONE_MONTH_MS) {
    const resetDate = new Date(lastTime + ONE_MONTH_MS).toLocaleDateString(
      'id-ID',
      { day: 'numeric', month: 'long', year: 'numeric' },
    );
    throw new AppError(
      400,
      `Kesempatan atur ulang jadwal bulan ini sudah digunakan. Kesempatan berikutnya akan tersedia pada tanggal ${resetDate}.`,
    );
  }

  const { schedules: newSchedules } = rescheduleInputSchema.parse(body);

  const activeRegistrations = await prisma.registration.findMany({
    where: {
      instructorId: userId,
      status: 'APPROVED',
      type: 'NEW_STUDENT',
      user: {
        studentProfile: { activeSessions: { gt: 0 } },
      },
    },
    select: {
      locationId: true,
      firstMeetDate: true,
      firstMeetSession: true,
    },
  });

  const activeStudentSchedules = findActiveStudentSchedules(
    user.schedules,
    activeRegistrations,
  );

  validateRetainedSchedules(activeStudentSchedules, newSchedules);

  const uniqueLocationIds = Array.from(
    new Set(newSchedules.map((s) => s.locationId)),
  );
  const validLocations = await prisma.location.findMany({
    where: { id: { in: uniqueLocationIds } },
    select: { id: true },
  });

  if (validLocations.length !== uniqueLocationIds.length) {
    throw new AppError(
      404,
      'Salah satu atau lebih lokasi kolam yang dipilih tidak ditemukan di sistem.',
    );
  }

  await prisma.$transaction(async (tx) => {
    const protectedScheduleIds = activeStudentSchedules.map((s) => s.id);

    await tx.schedule.deleteMany({
      where: {
        instructorId: userId,
        id: { notIn: protectedScheduleIds },
      },
    });

    const slotsToCreate = newSchedules.filter((ns) => {
      return !activeStudentSchedules.some(
        (as) =>
          as.locationId === ns.locationId &&
          as.dayOfWeek.trim().toLowerCase() === ns.dayOfWeek.trim().toLowerCase() &&
          as.sessionName.trim().toLowerCase() === ns.sessionName.trim().toLowerCase(),
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

  return true;
};
