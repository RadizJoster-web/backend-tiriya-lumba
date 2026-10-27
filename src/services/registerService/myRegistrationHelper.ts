import { prisma } from '../../config/prisma';

export function getDayName(d: Date | string): string {
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return '';
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  return days[dateObj.getDay()] ?? '';
}

export async function enrichInstructorSchedules(
  schedules: any[],
  instructorId: string,
  allSessionTimes: any[],
) {
  const approvedStudents = await prisma.registration.findMany({
    where: {
      instructorId,
      type: 'NEW_STUDENT',
      status: 'APPROVED',
    },
    include: {
      user: {
        include: {
          studentProfile: true,
        },
      },
    },
  });

  return schedules.map((s) => {
    const match = allSessionTimes.find(
      (st) =>
        st.dayOfWeek.trim().toLowerCase() === s.dayOfWeek.trim().toLowerCase() &&
        st.sessionName.trim().toLowerCase() === s.sessionName.trim().toLowerCase() &&
        (!st.locationId || st.locationId === s.locationId),
    );
    const startTime = match?.startTime ?? '';
    const endTime = match?.endTime ?? '';
    const timeRange = startTime && endTime ? `${startTime} - ${endTime} WIB` : '';
    const locationName = s.location?.name ?? 'Kolam';

    const studentCount = approvedStudents.filter((reg) => {
      if (reg.locationId && s.locationId && reg.locationId !== s.locationId) {
        return false;
      }

      const regSession = (reg.firstMeetSession || '').trim().toLowerCase();
      const schedSession = (s.sessionName || '').trim().toLowerCase();
      const sessionMatches =
        regSession === schedSession ||
        regSession.includes(schedSession) ||
        schedSession.includes(regSession);
      if (!sessionMatches) return false;

      if (reg.firstMeetDate) {
        const regDay = getDayName(reg.firstMeetDate).toLowerCase();
        const schedDay = (s.dayOfWeek || '').trim().toLowerCase();
        if (regDay && schedDay && regDay !== schedDay) return false;
      }

      const activeSessions = reg.user?.studentProfile?.activeSessions ?? 0;
      return activeSessions > 0;
    }).length;

    return {
      locationId: s.locationId,
      locationName,
      dayOfWeek: s.dayOfWeek,
      sessionName: s.sessionName,
      startTime,
      endTime,
      timeRange,
      totalStudents: studentCount,
    };
  });
}
