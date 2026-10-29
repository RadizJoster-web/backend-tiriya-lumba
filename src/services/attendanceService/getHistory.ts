import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';

export interface CurrentUserPayload {
  role?: string;
  locationId?: string | null;
}

export const getAttendanceHistoryService = async (
  currentUser?: CurrentUserPayload,
) => {
  const whereCondition: any = {};

  if (currentUser?.role === 'POOL_MANAGER') {
    if (!currentUser.locationId) {
      throw new AppError(
        403,
        'Akses ditolak: Akun manajer tidak terikat ke lokasi kolam.',
      );
    }

    const loc = await prisma.location.findUnique({
      where: { id: currentUser.locationId },
      select: { name: true },
    });

    if (!loc) {
      throw new AppError(404, 'Data lokasi kolam manajer tidak ditemukan.');
    }

    whereCondition.locationName = loc.name;
  }

  const attendances = await prisma.attendance.findMany({
    where: whereCondition,
    orderBy: { date: 'desc' },
    take: 100,
  });

  return attendances.map((a) => ({
    id: a.id,
    tgl: a.date.toISOString().slice(0, 10),
    nama: a.name,
    peran: a.role as 'Murid' | 'Pelatih',
    lokasi: a.locationName,
    st: a.status as 'Hadir' | 'Tidak Hadir',
  }));
};
