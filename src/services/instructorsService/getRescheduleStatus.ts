import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';

export const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

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

  const schedules = user.schedules.map((s) => ({
    id: s.id,
    locationId: s.locationId,
    locationName: s.location?.name ?? 'Kolam',
    dayOfWeek: s.dayOfWeek,
    sessionName: s.sessionName,
    hasStudent: Boolean(s.studentId),
  }));

  return {
    canReschedule,
    remainingTokens,
    lastRescheduledAt: user.instructorProfile.lastRescheduledAt,
    nextAvailableAt,
    schedules,
  };
};
