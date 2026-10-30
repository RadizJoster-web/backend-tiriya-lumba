import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import {
  AttendanceRowInput,
  CurrentUserPayload,
  processAttendanceRecord,
} from './submitRowHelper';
import { runTransactionWithRetry } from '../../utils/prismaTransaction';

export { AttendanceRowInput, CurrentUserPayload };

export const submitAttendanceService = async (
  body: unknown,
  currentUser?: CurrentUserPayload,
) => {
  const rows = Array.isArray(body) ? body : [body];

  if (!rows || rows.length === 0 || !rows[0]) {
    throw new AppError(400, 'Data absensi kosong.');
  }

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

  await runTransactionWithRetry(async (tx) => {
    for (const row of rows) {
      await processAttendanceRecord(
        tx,
        row,
        currentUser,
        managerLocationName,
        now,
        startOfToday,
        endOfToday,
      );
    }
  });

  return true;
};
