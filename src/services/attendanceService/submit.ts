import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';

export interface AttendanceRowInput {
  peran?: string;
  nama: string;
  st?: string;
  status?: string;
  lokasi?: string;
}

export const submitAttendanceService = async (body: unknown) => {
  const rows = Array.isArray(body) ? body : [body];

  if (!rows || rows.length === 0 || !rows[0]) {
    throw new AppError(400, 'Data absensi kosong.');
  }

  const todayDate = new Date();

  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      const peran = row.peran || 'Murid';
      const nama = row.nama;
      const status = row.st || row.status || 'Tidak Hadir';
      const locationName = row.lokasi || 'Kolam';

      let studentProfileId: string | undefined = undefined;
      if (peran === 'Murid') {
        const profile = await tx.studentProfile.findFirst({
          where: {
            OR: [{ fullName: nama }, { user: { fullName: nama } }],
          },
        });
        if (profile) {
          studentProfileId = profile.id;

          if (status === 'Hadir' && profile.activeSessions > 0) {
            await tx.studentProfile.update({
              where: { id: profile.id },
              data: {
                activeSessions: { decrement: 1 },
              },
            });
          }
        }
      }

      await tx.attendance.create({
        data: {
          name: nama,
          role: peran,
          locationName,
          status,
          date: todayDate,
          studentProfileId,
        },
      });
    }
  });

  return true;
};
