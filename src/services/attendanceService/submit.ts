import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';

export interface AttendanceRowInput {
  peran?: string;
  nama: string;
  st?: string;
  status?: string;
  lokasi?: string;
}

export interface CurrentUserPayload {
  role?: string;
  locationId?: string | null;
}

export const submitAttendanceService = async (
  body: unknown,
  currentUser?: CurrentUserPayload,
) => {
  const rows = Array.isArray(body) ? body : [body];

  if (!rows || rows.length === 0 || !rows[0]) {
    throw new AppError(400, 'Data absensi kosong.');
  }

  // Validasi scoping jika user adalah POOL_MANAGER
  let managerLocationName: string | undefined;
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
      throw new AppError(404, 'Lokasi kolam pengelola tidak ditemukan.');
    }
    managerLocationName = loc.name;
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      const peran = row.peran || 'Murid';
      const nama = row.nama?.trim();
      const status = row.st || row.status || 'Tidak Hadir';
      const locationName = managerLocationName || row.lokasi || 'Kolam';

      if (!nama) continue;

      let studentProfileId: string | undefined = undefined;
      let targetProfile = null;

      if (peran === 'Murid') {
        targetProfile = await tx.studentProfile.findFirst({
          where: {
            OR: [{ fullName: nama }, { user: { fullName: nama } }],
            ...(currentUser?.role === 'POOL_MANAGER'
              ? {
                  user: {
                    registrations: {
                      some: {
                        locationId: currentUser.locationId!,
                        status: 'APPROVED',
                      },
                    },
                  },
                }
              : {}),
          },
        });

        if (targetProfile) {
          studentProfileId = targetProfile.id;
        }
      }

      // Cek apakah sudah ada catatan absensi hari ini untuk orang/murid ini
      const existingAttendance = await tx.attendance.findFirst({
        where: {
          name: nama,
          role: peran,
          locationName,
          date: {
            gte: startOfToday,
            lte: endOfToday,
          },
        },
      });

      if (existingAttendance) {
        const wasHadir = existingAttendance.status === 'Hadir';
        const isNowHadir = status === 'Hadir';

        // Rekonsiliasi activeSessions
        if (targetProfile) {
          if (!wasHadir && isNowHadir && targetProfile.activeSessions > 0) {
            // Berubah dari Tidak Hadir -> Hadir: potong 1 sesi
            await tx.studentProfile.update({
              where: { id: targetProfile.id },
              data: { activeSessions: { decrement: 1 } },
            });
          } else if (wasHadir && !isNowHadir) {
            // Berubah dari Hadir -> Tidak Hadir: kembalikan 1 sesi (refund)
            await tx.studentProfile.update({
              where: { id: targetProfile.id },
              data: { activeSessions: { increment: 1 } },
            });
          }
        }

        // Perbarui status record absensi hari ini
        await tx.attendance.update({
          where: { id: existingAttendance.id },
          data: { status, date: now },
        });
      } else {
        // Belum pernah diabsen hari ini
        if (targetProfile && status === 'Hadir' && targetProfile.activeSessions > 0) {
          await tx.studentProfile.update({
            where: { id: targetProfile.id },
            data: { activeSessions: { decrement: 1 } },
          });
        }

        await tx.attendance.create({
          data: {
            name: nama,
            role: peran,
            locationName,
            status,
            date: now,
            studentProfileId,
          },
        });
      }
    }
  });

  return true;
};
