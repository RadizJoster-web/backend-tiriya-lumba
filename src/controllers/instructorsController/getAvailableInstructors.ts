import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { getAvailableInstructorsQuerySchema } from './instructorSchema';

const MAX_REGULAR_CAPACITY = 5;
const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const getAvailableInstructors = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { locationId, dayOfWeek, sessionName, packageType } =
      getAvailableInstructorsQuerySchema.parse(req.query);

    // 1. Filter guru:
    // - Role INSTRUCTOR & aktif
    // - Kolam renang cocok
    // - WAJIB memiliki jadwal mengajar terdaftar pada hari (dayOfWeek) dan sesi (sessionName) yang dipilih
    const instructors = await prisma.user.findMany({
      where: {
        role: 'INSTRUCTOR',
        isActive: true,
        instructorProfile: {
          locations: {
            some: {
              id: locationId,
            },
          },
        },
        schedules: {
          some: {
            locationId,
            dayOfWeek,
            sessionName,
          },
        },
      },
      select: {
        id: true,
        fullName: true,
        profilePictureUrl: true,
        instructorProfile: {
          select: {
            experience: true,
            license: true,
            shortBio: true,
          },
        },
      },
    });

    // 2. Ambil master package untuk pemetaan tipe kelas (PRIVAT vs REGULER)
    const packages = await prisma.package.findMany({
      select: { id: true, type: true },
    });
    const packageTypeMap = new Map(
      packages.map((p) => [p.id, p.type.trim().toUpperCase()]),
    );

    // 3. Ambil data antrean booking murid aktif (PENDING atau APPROVED) pada sesi dan lokasi ini
    const activeStudentBookings = await prisma.registration.findMany({
      where: {
        locationId,
        firstMeetSession: sessionName,
        status: { in: ['PENDING', 'APPROVED'] },
        type: 'NEW_STUDENT',
        instructorId: { in: instructors.map((i) => i.id) },
      },
      select: {
        instructorId: true,
        firstMeetDate: true,
        packageId: true,
        status: true,
        user: {
          select: {
            studentProfile: {
              select: { activeSessions: true },
            },
          },
        },
      },
    });

    // 4. Hitung murid aktif per pelatih khusus pada hari (dayOfWeek) yang dipilih
    const slotInfoByInstructor = new Map<
      string,
      { hasPrivat: boolean; regularCount: number; totalCount: number }
    >();

    for (const b of activeStudentBookings) {
      if (!b.instructorId || !b.firstMeetDate) continue;

      const bDate = new Date(b.firstMeetDate);
      const bDay = DAYS_ID[bDate.getDay()];
      if (!bDay || bDay.trim().toLowerCase() !== dayOfWeek.trim().toLowerCase()) continue;

      // Abaikan jika siswa sudah APPROVED tetapi sisa pertemuannya sudah 0 (paket telah usai)
      const activeSessions = b.user?.studentProfile?.activeSessions ?? 0;
      if (b.status === 'APPROVED' && activeSessions <= 0) continue;

      const pkgType = packageTypeMap.get(b.packageId ?? '') || '';
      const isPrivat = pkgType.includes('PRIVAT');

      const info = slotInfoByInstructor.get(b.instructorId) || {
        hasPrivat: false,
        regularCount: 0,
        totalCount: 0,
      };

      if (isPrivat) {
        info.hasPrivat = true;
      } else {
        info.regularCount += 1;
      }
      info.totalCount += 1;

      slotInfoByInstructor.set(b.instructorId, info);
    }

    // 5. Tentukan ketersediaan pelatih berdasarkan aturan mutual-exclusion Privat vs Reguler
    const availableInstructors = instructors
      .map((instructor) => {
        const info = slotInfoByInstructor.get(instructor.id) || {
          hasPrivat: false,
          regularCount: 0,
          totalCount: 0,
        };

        const isSlotPrivat = info.hasPrivat;
        const currentStudentCount = isSlotPrivat ? 1 : info.regularCount;
        const maxCapacity = packageType === 'PRIVAT' ? 1 : MAX_REGULAR_CAPACITY;

        // Aturan Ketersediaan:
        // - Jika calon murid memilih PRIVAT:
        //   Guru HANYA TERSEDIA jika slot benar-benar kosong (0 murid).
        // - Jika calon murid memilih REGULER:
        //   Guru TIDAK TERSEDIA jika slot sudah diisi murid PRIVAT (eksklusif 1-on-1).
        //   Guru TERSEDIA jika belum ada murid PRIVAT dan jumlah murid reguler < 5.
        let isAvailable = false;
        if (packageType === 'PRIVAT') {
          isAvailable = info.totalCount === 0;
        } else {
          isAvailable = !info.hasPrivat && info.regularCount < MAX_REGULAR_CAPACITY;
        }

        return {
          instructorId: instructor.id,
          fullName: instructor.fullName,
          profilePictureUrl: instructor.profilePictureUrl,
          experience: instructor.instructorProfile?.experience || null,
          license: instructor.instructorProfile?.license || null,
          shortBio: instructor.instructorProfile?.shortBio || null,
          currentStudentCount,
          maxCapacity,
          hasPrivat: info.hasPrivat,
          isAvailable,
        };
      })
      .filter((coach) => coach.isAvailable);

    return res.status(200).json({
      success: true,
      data: availableInstructors,
    });
  } catch (err) {
    next(err);
  }
};
