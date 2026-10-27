import { prisma } from '../../config/prisma';
import { DAYS_ID } from './attendanceHelper';

export interface CurrentUserPayload {
  role?: string;
  locationId?: string | null;
}

export const getAttendanceTodayService = async (
  currentUser: CurrentUserPayload,
  queryLocationId?: string,
) => {
  const now = new Date();
  const todayName = DAYS_ID[now.getDay()];
  const todayDateStr = now.toISOString().slice(0, 10);

  let locationId = queryLocationId;
  if (currentUser.role === 'POOL_MANAGER') {
    locationId = currentUser.locationId ?? undefined;
  }

  // 1. Jadwal pelatih hari ini
  const instructorSchedules = await prisma.schedule.findMany({
    where: {
      dayOfWeek: todayName,
      ...(locationId ? { locationId } : {}),
    },
    include: {
      instructor: {
        select: { id: true, fullName: true, isActive: true },
      },
      location: {
        select: { id: true, name: true },
      },
    },
  });

  // 2. Murid aktif hari ini
  const studentRegistrations = await prisma.registration.findMany({
    where: {
      type: 'NEW_STUDENT',
      status: 'APPROVED',
      ...(locationId ? { locationId } : {}),
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          isActive: true,
          studentProfile: true,
        },
      },
    },
  });

  const locations = await prisma.location.findMany();
  const locationMap = new Map(locations.map((l) => [l.id, l.name]));

  const matchingStudents = studentRegistrations.filter((reg) => {
    if (!reg.firstMeetDate) return false;
    const meetDate = new Date(reg.firstMeetDate);
    const meetDay = DAYS_ID[meetDate.getDay()];
    return meetDay === todayName;
  });

  // 3. Absensi yang sudah tercatat
  const existingAttendances = await prisma.attendance.findMany({
    where: {
      date: {
        gte: new Date(`${todayDateStr}T00:00:00.000Z`),
        lte: new Date(`${todayDateStr}T23:59:59.999Z`),
      },
    },
  });

  const attendanceStatusMap = new Map(
    existingAttendances.map((a) => [`${a.role}|${a.name}`, a.status]),
  );

  const people: any[] = [];
  const addedKeys = new Set<string>();

  for (const s of instructorSchedules) {
    if (!s.instructor) continue;
    const key = `Pelatih|${s.instructor.fullName}`;
    if (!addedKeys.has(key)) {
      addedKeys.add(key);
      people.push({
        peran: 'Pelatih',
        nama: s.instructor.fullName,
        lokasi: s.location?.name ?? 'Kolam',
        sesi: s.sessionName,
        status: attendanceStatusMap.get(key) ?? 'Tidak Hadir',
      });
    }
  }

  for (const reg of matchingStudents) {
    const studentName =
      reg.user?.studentProfile?.fullName || reg.user?.fullName;
    if (!studentName) continue;
    const key = `Murid|${studentName}`;
    if (!addedKeys.has(key)) {
      addedKeys.add(key);
      const locName = reg.locationId ? locationMap.get(reg.locationId) ?? '-' : '-';
      people.push({
        peran: 'Murid',
        nama: studentName,
        lokasi: locName,
        sesi: reg.firstMeetSession ?? 'Sesi 1',
        status: attendanceStatusMap.get(key) ?? 'Tidak Hadir',
      });
    }
  }

  return {
    today: todayName,
    date: todayDateStr,
    totalItems: people.length,
    data: people,
  };
};
