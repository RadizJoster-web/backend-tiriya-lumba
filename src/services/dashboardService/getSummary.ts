import { prisma } from '../../config/prisma';
import {
  buildMonthChartData,
  buildYearChartData,
} from './chartHelper';
import { AppError } from '../../utils/appError';

export interface DashboardSummaryQuery {
  year?: string | number;
  month?: string;
}

export interface CurrentUserPayload {
  role?: string;
  locationId?: string | null;
}

export const getDashboardSummaryService = async (
  currentUser: CurrentUserPayload,
  query: DashboardSummaryQuery,
) => {
  const year =
    parseInt(String(query.year), 10) || new Date().getFullYear();
  const monthQuery = query.month || 'ALL';

  const isPoolManager = currentUser.role === 'POOL_MANAGER';
  if (isPoolManager && !currentUser.locationId) {
    throw new AppError(
      403,
      'Akses ditolak: Akun manajer tidak terikat ke lokasi kolam.',
    );
  }
  const locationId = isPoolManager ? currentUser.locationId ?? undefined : undefined;

  const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
  const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

  const studentCountPromise = locationId
    ? prisma.registration.count({
        where: {
          type: 'NEW_STUDENT',
          status: 'APPROVED',
          locationId,
          user: {
            studentProfile: {
              activeSessions: { gt: 0 },
            },
          },
        },
      })
    : prisma.studentProfile.count({
        where: {
          activeSessions: { gt: 0 },
        },
      });

  const instructorCountPromise = locationId
    ? prisma.user.count({
        where: {
          role: 'INSTRUCTOR',
          isActive: true,
          instructorProfile: {
            locations: {
              some: { id: locationId },
            },
          },
        },
      })
    : prisma.user.count({
        where: {
          role: 'INSTRUCTOR',
          isActive: true,
        },
      });

  const registrationsPromise = prisma.registration.findMany({
    where: {
      createdAt: {
        gte: startOfYear,
        lte: endOfYear,
      },
      ...(locationId ? { locationId } : {}),
    },
    select: {
      createdAt: true,
    },
  });

  // Paralel query untuk mengeliminasi network waterfall roundtrips
  const [totalSiswa, totalGuru, yearRegistrations] = await Promise.all([
    studentCountPromise,
    instructorCountPromise,
    registrationsPromise,
  ]);

  let chartData;
  if (monthQuery === 'ALL') {
    chartData = buildYearChartData(yearRegistrations, year);
  } else {
    const monthIdx = parseInt(monthQuery, 10);
    chartData = buildMonthChartData(yearRegistrations, monthIdx, year);
  }

  return {
    totalSiswa,
    totalGuru,
    totalPendaftar: chartData.total,
    chartData,
  };
};
