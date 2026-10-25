import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { getAvailableInstructorsQuerySchema } from './instructorSchema';

const MAX_REGULAR_CAPACITY = 5;

export const getAvailableInstructors = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { locationId, dayOfWeek, sessionName, packageType } =
      getAvailableInstructorsQuerySchema.parse(req.query);

    // Filter guru:
    // 1. Role INSTRUCTOR & aktif
    // 2. Kolam renang cocok
    // 3. WAJIB memiliki jadwal mengajar terdaftar pada hari (dayOfWeek) dan sesi (sessionName) yang dipilih
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
        schedules: {
          where: {
            locationId,
            dayOfWeek,
            sessionName,
            studentId: { not: null },
          },
          select: {
            id: true,
            studentId: true,
          },
        },
      },
    });

    // Ambil data antrean booking murid aktif (PENDING atau APPROVED) pada sesi ini
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
      },
    });

    const bookingCountByInstructor = new Map<string, number>();
    for (const b of activeStudentBookings) {
      if (b.instructorId) {
        bookingCountByInstructor.set(
          b.instructorId,
          (bookingCountByInstructor.get(b.instructorId) ?? 0) + 1,
        );
      }
    }

    const availableInstructors = instructors
      .map((instructor) => {
        const scheduleStudents = instructor.schedules.length;
        const bookedStudents =
          bookingCountByInstructor.get(instructor.id) ?? 0;
        const currentStudentCount = Math.max(scheduleStudents, bookedStudents);
        const maxCapacity =
          packageType === 'PRIVAT' ? 1 : MAX_REGULAR_CAPACITY;

        return {
          instructorId: instructor.id,
          fullName: instructor.fullName,
          profilePictureUrl: instructor.profilePictureUrl,
          experience: instructor.instructorProfile?.experience || null,
          license: instructor.instructorProfile?.license || null,
          shortBio: instructor.instructorProfile?.shortBio || null,
          currentStudentCount,
          maxCapacity,
        };
      })
      .filter((coach) => {
        if (packageType === 'PRIVAT') {
          // Untuk kelas PRIVAT: Guru HANYA TERSEDIA jika BELUM ADA murid di slot ini (0 murid)
          return coach.currentStudentCount === 0;
        } else {
          // Untuk kelas REGULER: Guru TERSEDIA selama jumlah murid belum mencapai batas kuota
          return coach.currentStudentCount < coach.maxCapacity;
        }
      });

    return res.status(200).json({
      success: true,
      data: availableInstructors,
    });
  } catch (err) {
    next(err);
  }
};
