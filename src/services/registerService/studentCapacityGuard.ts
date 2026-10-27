import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';

export const DAYS_ID = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];
export const MAX_REGULAR_CAPACITY = 5;

export interface CapacityGuardParams {
  userId: string;
  instructorId: string;
  instructorName: string;
  locationId: string;
  firstMeetDate: string;
  firstMeetSession: string;
  packageType: string;
}

export async function validateStudentCapacityAndClash(
  params: CapacityGuardParams,
) {
  const meetDate = new Date(params.firstMeetDate);
  const dayOfWeek = DAYS_ID[meetDate.getDay()] || 'Senin';

  // 1. Verifikasi deklarasi jadwal pelatih
  const declaredSchedule = await prisma.schedule.findFirst({
    where: {
      instructorId: params.instructorId,
      locationId: params.locationId,
      dayOfWeek,
      sessionName: params.firstMeetSession,
    },
  });

  if (!declaredSchedule) {
    throw new AppError(
      400,
      `Pelatih ${params.instructorName} tidak memiliki jadwal mengajar pada hari ${dayOfWeek} (${params.firstMeetSession}) di lokasi yang dipilih.`,
    );
  }

  const isNewRegistrationPrivat = params.packageType
    .trim()
    .toUpperCase()
    .includes('PRIVAT');

  const packages = await prisma.package.findMany({
    select: { id: true, type: true },
  });
  const packageTypeMap = new Map(
    packages.map((p) => [p.id, p.type.trim().toUpperCase()]),
  );

  const existingBookings = await prisma.registration.findMany({
    where: {
      instructorId: params.instructorId,
      locationId: params.locationId,
      firstMeetSession: params.firstMeetSession,
      status: { in: ['PENDING', 'APPROVED'] },
      type: 'NEW_STUDENT',
      userId: { not: params.userId },
    },
    select: {
      id: true,
      firstMeetDate: true,
      packageId: true,
      status: true,
      user: {
        select: {
          studentProfile: {
            select: { activeSessions: true },
          },
        },
      },
    },
  });

  const sameDayBookings = existingBookings.filter((b) => {
    if (!b.firstMeetDate) return false;
    const bDate = new Date(b.firstMeetDate);
    const bDay = DAYS_ID[bDate.getDay()];
    if (!bDay || bDay !== dayOfWeek) return false;
    const activeSessions = b.user?.studentProfile?.activeSessions ?? 0;
    if (b.status === 'APPROVED' && activeSessions <= 0) return false;
    return true;
  });

  const hasExistingPrivat = sameDayBookings.some((b) =>
    (packageTypeMap.get(b.packageId ?? '') || '').includes('PRIVAT'),
  );

  if (isNewRegistrationPrivat) {
    if (sameDayBookings.length > 0) {
      throw new AppError(
        400,
        `Kelas Privat memerlukan sesi eksklusif 1-on-1. Pelatih ${params.instructorName} sudah memiliki murid pada hari ${dayOfWeek} (${params.firstMeetSession}). Silakan pilih sesi atau pelatih lain.`,
      );
    }
  } else {
    if (hasExistingPrivat) {
      throw new AppError(
        400,
        `Sesi hari ${dayOfWeek} (${params.firstMeetSession}) bersama pelatih ${params.instructorName} telah dipesan sebagai Kelas Privat (eksklusif) dan tidak dapat digabung dengan kelas Reguler.`,
      );
    }

    if (sameDayBookings.length >= MAX_REGULAR_CAPACITY) {
      throw new AppError(
        400,
        `Kapasitas kelas reguler pelatih ${params.instructorName} pada hari ${dayOfWeek} (${params.firstMeetSession}) sudah penuh (${sameDayBookings.length}/${MAX_REGULAR_CAPACITY} murid). Silakan pilih sesi atau pelatih lain.`,
      );
    }
  }

  return true;
}
