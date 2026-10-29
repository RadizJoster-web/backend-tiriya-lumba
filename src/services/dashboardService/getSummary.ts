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

  // 1. Total Siswa Aktif
  let totalSiswa = 0;
  if (locationId) {
    totalSiswa = await prisma.registration.count({
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
    });
  } else {
    totalSiswa = await prisma.studentProfile.count({
      where: {
        activeSessions: { gt: 0 },
      },
    });
  }

  // 2. Total Pelatih Aktif
  let totalGuru = 0;
  if (locationId) {
    totalGuru = await prisma.user.count({
      where: {
        role: 'INSTRUCTOR',
        isActive: true,
        instructorProfile: {
          locations: {
            some: { id: locationId },
          },
        },
      },
    });
  } else {
    totalGuru = await prisma.user.count({
      where: {
        role: 'INSTRUCTOR',
        isActive: true,
      },
    });
  }

  // 3. Registrasi pada tahun terpilih
  const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
  const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

  const yearRegistrations = await prisma.registration.findMany({
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
