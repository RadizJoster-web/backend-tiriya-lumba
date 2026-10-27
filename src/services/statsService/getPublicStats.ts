import { prisma } from '../../config/prisma';

export const getPublicStatsService = async () => {
  const [totalStudents, totalInstructors, totalPools, totalAreas] =
    await Promise.all([
      prisma.studentProfile.count(),
      prisma.user.count({
        where: {
          role: 'INSTRUCTOR',
          isActive: true,
        },
      }),
      prisma.location.count(),
      prisma.area.count(),
    ]);

  return {
    totalStudents,
    totalInstructors,
    totalPools,
    totalAreas,
  };
};
