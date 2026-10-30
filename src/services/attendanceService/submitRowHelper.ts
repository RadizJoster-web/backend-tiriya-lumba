import { Prisma } from '@prisma/client';

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

export async function processAttendanceRecord(
  tx: Prisma.TransactionClient,
  row: AttendanceRowInput,
  currentUser: CurrentUserPayload | undefined,
  managerLocationName: string | undefined,
  now: Date,
  startOfToday: Date,
  endOfToday: Date,
) {
  const peran = row.peran || 'Murid';
  const nama = row.nama?.trim();
  const status = row.st || row.status || 'Tidak Hadir';
  const locationName = managerLocationName || row.lokasi || 'Kolam';

  if (!nama) return;

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

  const existingAttendance = await tx.attendance.findFirst({
    where: {
      name: nama,
      role: peran,
      locationName,
      date: { gte: startOfToday, lte: endOfToday },
    },
  });

  if (existingAttendance) {
    const wasHadir = existingAttendance.status === 'Hadir';
    const isNowHadir = status === 'Hadir';

    if (targetProfile) {
      if (!wasHadir && isNowHadir && targetProfile.activeSessions > 0) {
        await tx.studentProfile.update({
          where: { id: targetProfile.id },
          data: { activeSessions: { decrement: 1 } },
        });
      } else if (wasHadir && !isNowHadir) {
        await tx.studentProfile.update({
          where: { id: targetProfile.id },
          data: { activeSessions: { increment: 1 } },
        });
      }
    }

    await tx.attendance.update({
      where: { id: existingAttendance.id },
      data: { status, date: now },
    });
  } else {
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
