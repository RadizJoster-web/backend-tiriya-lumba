import { prisma } from '../../config/prisma';

export const getMyAttendanceHistoryService = async (userId: string) => {
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId },
  });

  if (!studentProfile) {
    return [];
  }

  const attendances = await prisma.attendance.findMany({
    where: {
      OR: [
        { studentProfileId: studentProfile.id },
        { name: studentProfile.fullName, role: 'Murid' },
      ],
    },
    orderBy: { date: 'desc' },
  });

  return attendances.map((a) => ({
    id: a.id,
    date: a.date.toISOString(),
    locationName: a.locationName,
    status: a.status,
  }));
};
