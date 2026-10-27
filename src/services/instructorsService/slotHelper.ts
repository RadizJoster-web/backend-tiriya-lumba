export const MAX_REGULAR_CAPACITY = 5;
export const DAYS_ID = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

export interface StudentBookingItem {
  instructorId: string | null;
  firstMeetDate: Date | null;
  packageId: string | null;
  status: string;
  user: {
    studentProfile: {
      activeSessions: number;
    } | null;
  } | null;
}

export function calculateInstructorSlots(
  activeBookings: StudentBookingItem[],
  packageTypeMap: Map<string, string>,
  dayOfWeek: string,
) {
  const slotInfoByInstructor = new Map<
    string,
    { hasPrivat: boolean; regularCount: number; totalCount: number }
  >();

  for (const b of activeBookings) {
    if (!b.instructorId || !b.firstMeetDate) continue;

    const bDate = new Date(b.firstMeetDate);
    const bDay = DAYS_ID[bDate.getDay()];
    if (!bDay || bDay.trim().toLowerCase() !== dayOfWeek.trim().toLowerCase()) {
      continue;
    }

    if (b.status === 'APPROVED') {
      const activeSessions = b.user?.studentProfile?.activeSessions ?? 0;
      if (activeSessions <= 0) continue;
    }

    const currentSlot = slotInfoByInstructor.get(b.instructorId) || {
      hasPrivat: false,
      regularCount: 0,
      totalCount: 0,
    };

    const pkgType = b.packageId
      ? packageTypeMap.get(b.packageId) ?? 'REGULER'
      : 'REGULER';

    if (pkgType.includes('PRIVAT')) {
      currentSlot.hasPrivat = true;
    } else {
      currentSlot.regularCount += 1;
    }

    currentSlot.totalCount += 1;
    slotInfoByInstructor.set(b.instructorId, currentSlot);
  }

  return slotInfoByInstructor;
}
