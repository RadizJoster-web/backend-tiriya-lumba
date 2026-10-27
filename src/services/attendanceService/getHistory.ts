import { prisma } from '../../config/prisma';

export const getAttendanceHistoryService = async () => {
  const attendances = await prisma.attendance.findMany({
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
