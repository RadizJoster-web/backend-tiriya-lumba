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

    const instructors = await prisma.user.findMany({
      where: {
        role: 'INSTRUCTOR',
        isActive: true,
        InstructorProfile: {
          locations: {
            some: {
              id: locationId,
            },
          },
        },
      },
      select: {
        id: true,
        fullName: true,
        profilePictureUrl: true,
        InstructorProfile: {
          select: {
            experience: true,
            license: true,
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

    const availableInstructors = instructors
      .filter((instructor) => {
        const currentStudentCount = instructor.schedules.length;

        if (packageType === 'PRIVAT') {
          // Untuk kelas PRIVAT: Guru HANYA TERSEDIA jika BELUM ADA murid di slot ini (0 murid)
          return currentStudentCount === 0;
        } else {
          // Untuk kelas REGULER: Guru TERSEDIA selama jumlah murid belum mencapai batas kuota
          return currentStudentCount < MAX_REGULAR_CAPACITY;
        }
      })
      .map((instructor) => ({
        instructorId: instructor.id,
        fullName: instructor.fullName,
        profilePictureUrl: instructor.profilePictureUrl,
        experience: instructor.InstructorProfile?.experience || null,
        license: instructor.InstructorProfile?.license || null,
        currentStudentCount: instructor.schedules.length,
        maxCapacity: packageType === 'PRIVAT' ? 1 : MAX_REGULAR_CAPACITY,
      }));

    return res.status(200).json({
      success: true,
      data: availableInstructors,
    });
  } catch (err) {
    next(err);
  }
};
