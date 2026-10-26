import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';

const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

/**
 * Mengambil daftar orang (pelatih & murid) yang memiliki jadwal latihan HARI INI
 */
export const getAttendanceTodayController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUser = (req as any).user;
    const now = new Date();
    const todayName = DAYS_ID[now.getDay()]; // Hari ini (misal: "Senin")
    const todayDateStr = now.toISOString().slice(0, 10);

    let locationId = req.query.locationId as string | undefined;
    if (currentUser.role === 'POOL_MANAGER') {
      locationId = currentUser.locationId;
    }

    // 1. Ambil jadwal pelatih yang mengajar hari ini
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

    // 2. Ambil murid aktif yang jadwal latihannya jatuh pada hari ini
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

    // Ambil master lokasi
    const locations = await prisma.location.findMany();
    const locationMap = new Map(locations.map((l) => [l.id, l.name]));

    // Filter murid yang hari pertemuannya sama dengan hari ini
    const matchingStudents = studentRegistrations.filter((reg) => {
      if (!reg.firstMeetDate) return false;
      const meetDate = new Date(reg.firstMeetDate);
      const meetDay = DAYS_ID[meetDate.getDay()];
      return meetDay === todayName;
    });

    // 3. Ambil absensi yang sudah tercatat hari ini
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

    // Tambahkan pelatih yang jadwalnya hari ini
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

    // Tambahkan murid yang jadwal latihannya hari ini
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

    return res.status(200).json({
      success: true,
      today: todayName,
      date: todayDateStr,
      totalItems: people.length,
      data: people,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Menyimpan absensi hari ini ke tabel Attendance
 */
export const submitAttendanceController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rows = Array.isArray(req.body) ? req.body : [req.body];

    if (!rows || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Data absensi kosong.',
      });
    }

    const todayDate = new Date();

    await prisma.$transaction(async (tx) => {
      for (const row of rows) {
        const peran = row.peran || 'Murid';
        const nama = row.nama;
        const status = row.st || row.status || 'Tidak Hadir';
        const locationName = row.lokasi || 'Kolam';

        // Cari profile murid jika perannya murid
        let studentProfileId: string | undefined = undefined;
        if (peran === 'Murid') {
          const profile = await tx.studentProfile.findFirst({
            where: {
              OR: [{ fullName: nama }, { user: { fullName: nama } }],
            },
          });
          if (profile) {
            studentProfileId = profile.id;

            // Jika hadir, lakukan decrement activeSessions (Sesuai Steps.txt Hari 22)
            if (status === 'Hadir' && profile.activeSessions > 0) {
              await tx.studentProfile.update({
                where: { id: profile.id },
                data: {
                  activeSessions: { decrement: 1 },
                },
              });
              // Catatan Arsitektur: Jangan ubah user.isActive = false ketika activeSessions habis,
              // agar murid tetap dapat login ke portal /profile dan melakukan Perpanjangan Paket (Daftar Ulang).
            }
          }
        }

        // Simpan baris Attendance
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

    return res.status(200).json({
      success: true,
      message: 'Absensi hari ini berhasil disimpan.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mengambil riwayat absensi untuk ditampilkan di tabel dashboard
 */
export const getAttendanceHistoryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const attendances = await prisma.attendance.findMany({
      orderBy: { date: 'desc' },
      take: 100,
    });

    const result = attendances.map((a) => ({
      id: a.id,
      tgl: a.date.toISOString().slice(0, 10),
      nama: a.name,
      peran: a.role as 'Murid' | 'Pelatih',
      lokasi: a.locationName,
      st: a.status as 'Hadir' | 'Tidak Hadir',
    }));

    return res.status(200).json({
      success: true,
      totalItems: result.length,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mengambil riwayat absensi khusus untuk murid yang sedang login
 */
export const getMyAttendanceHistoryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.userId;

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!studentProfile) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const attendances = await prisma.attendance.findMany({
      where: {
        OR: [
          { studentProfileId: studentProfile.id },
          { name: studentProfile.fullName, role: 'Murid' },
        ],
      },
      orderBy: { date: 'desc' },
    });

    const data = attendances.map((a) => ({
      id: a.id,
      date: a.date.toISOString(),
      locationName: a.locationName,
      status: a.status,
    }));

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
