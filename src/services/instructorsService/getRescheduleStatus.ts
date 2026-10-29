import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';

export const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
export const DAYS_ID = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

export const getRescheduleStatusService = async (userId: string) => {
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
    throw new AppError(403, 'Akses khusus pelatih aktif Tirya Lumba.');
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

  // Ambil pendaftaran murid yang aktif dengan sisa sesi > 0
  const activeRegistrations = await prisma.registration.findMany({
    where: {
      instructorId: userId,
      status: 'APPROVED',
      type: 'NEW_STUDENT',
      user: {
        studentProfile: {
          activeSessions: { gt: 0 },
        },
      },
    },
    select: {
      locationId: true,
      firstMeetDate: true,
      firstMeetSession: true,
    },
  });

  const schedules = user.schedules.map((s) => {
    const hasActiveStudentBooking = activeRegistrations.some((reg) => {
      if (!reg.firstMeetDate) return false;
      const d = new Date(reg.firstMeetDate);
      const dayName = DAYS_ID[d.getDay()];
      return (
        reg.locationId === s.locationId &&
        reg.firstMeetSession?.trim().toLowerCase() ===
          s.sessionName.trim().toLowerCase() &&
        dayName?.trim().toLowerCase() === s.dayOfWeek.trim().toLowerCase()
      );
    });

    return {
      id: s.id,
      locationId: s.locationId,
      locationName: s.location?.name ?? 'Kolam',
      dayOfWeek: s.dayOfWeek,
      sessionName: s.sessionName,
      hasStudent: Boolean(s.studentId) || hasActiveStudentBooking,
    };
  });

  return {
    canReschedule,
    remainingTokens,
    lastRescheduledAt: user.instructorProfile.lastRescheduledAt,
    nextAvailableAt,
    schedules,
  };
};
