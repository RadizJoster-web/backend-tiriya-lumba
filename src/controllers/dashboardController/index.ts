import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agt',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

export const getDashboardSummaryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUser = (req as any).user;
    const year = parseInt(req.query.year as string, 10) || new Date().getFullYear();
    const monthQuery = (req.query.month as string) || 'ALL';

    const isPoolManager = currentUser.role === 'POOL_MANAGER';
    const locationId = isPoolManager ? currentUser.locationId : undefined;

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

    // 3. Tarik tanggal registrasi untuk tahun terpilih (Hanya field createdAt, hemat memori)
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
      const monthlyCounts = MONTHS_SHORT.map((_, monthIndex) => {
        return yearRegistrations.filter((r) => {
          return new Date(r.createdAt).getMonth() === monthIndex;
        }).length;
      });

      const totalPendaftar = monthlyCounts.reduce((a, b) => a + b, 0);

      chartData = {
        data: monthlyCounts,
        labels: MONTHS_SHORT,
        total: totalPendaftar,
        title: `Tren Pendaftaran Tahun ${year}`,
        subtitle: `Data pendaftaran per bulan untuk tahun ${year}`,
        statLabel: `Total pendaftar (${year})`,
      };
    } else {
      const monthIdx = parseInt(monthQuery, 10);
      const monthFiltered = yearRegistrations.filter((r) => {
        return new Date(r.createdAt).getMonth() === monthIdx;
      });

      const weekLabels = [
        'Mgg 1 (1-7)',
        'Mgg 2 (8-14)',
        'Mgg 3 (15-21)',
        'Mgg 4 (22-28)',
        'Mgg 5 (29-31)',
      ];

      const weeklyCounts = [
        monthFiltered.filter((r) => {
          const date = new Date(r.createdAt).getDate();
          return date >= 1 && date <= 7;
        }).length,
        monthFiltered.filter((r) => {
          const date = new Date(r.createdAt).getDate();
          return date >= 8 && date <= 14;
        }).length,
        monthFiltered.filter((r) => {
          const date = new Date(r.createdAt).getDate();
          return date >= 15 && date <= 21;
        }).length,
        monthFiltered.filter((r) => {
          const date = new Date(r.createdAt).getDate();
          return date >= 22 && date <= 28;
        }).length,
        monthFiltered.filter((r) => {
          const date = new Date(r.createdAt).getDate();
          return date >= 29;
        }).length,
      ];

      const monthName = MONTH_NAMES[monthIdx] ?? `Bulan ${monthIdx + 1}`;
      const totalPendaftar = weeklyCounts.reduce((a, b) => a + b, 0);

      chartData = {
        data: weeklyCounts,
        labels: weekLabels,
        total: totalPendaftar,
        title: `Tren Pendaftaran ${monthName} ${year}`,
        subtitle: `Distribusi pendaftaran per minggu di bulan ${monthName} ${year}`,
        statLabel: `Total pendaftar (${monthName} ${year})`,
      };
    }

    return res.status(200).json({
      success: true,
      data: {
        totalSiswa,
        totalGuru,
        totalPendaftar: chartData.total,
        chartData,
      },
    });
  } catch (error) {
    next(error);
  }
};
