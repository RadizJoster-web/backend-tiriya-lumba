import { prisma } from '../../config/prisma';
import {
  calculateInstructorSlots,
  MAX_REGULAR_CAPACITY,
} from './slotHelper';
import { getAvailableInstructorsQuerySchema } from './instructorSchema';

export const getAvailableInstructorsService = async (query: unknown) => {
  const { locationId, dayOfWeek, sessionName, packageType } =
    getAvailableInstructorsQuerySchema.parse(query);

  const instructors = await prisma.user.findMany({
    where: {
      role: 'INSTRUCTOR',
      isActive: true,
      instructorProfile: {
        locations: {
          some: { id: locationId },
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

  const packages = await prisma.package.findMany({
    select: { id: true, type: true },
  });
  const packageTypeMap = new Map(
    packages.map((p) => [p.id, p.type.trim().toUpperCase()]),
  );

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

  const slotInfoByInstructor = calculateInstructorSlots(
    activeStudentBookings,
    packageTypeMap,
    dayOfWeek,
  );

  const normalizedRequestedPkg = (packageType || '').trim().toUpperCase();
  const isRequestingPrivat = normalizedRequestedPkg.includes('PRIVAT');

  return instructors
    .filter((instructor) => {
      const slot = slotInfoByInstructor.get(instructor.id) || {
        hasPrivat: false,
        regularCount: 0,
        totalCount: 0,
      };

      if (isRequestingPrivat) {
        return slot.totalCount === 0;
      }

      if (slot.hasPrivat) {
        return false;
      }

      return slot.regularCount < MAX_REGULAR_CAPACITY;
    })
    .map((instructor) => {
      const slot = slotInfoByInstructor.get(instructor.id) || {
        hasPrivat: false,
        regularCount: 0,
        totalCount: 0,
      };

      const currentSlots = slot.hasPrivat ? 1 : slot.regularCount;
      const remainingSlots = slot.hasPrivat
        ? 0
        : Math.max(0, MAX_REGULAR_CAPACITY - slot.regularCount);

      return {
        id: instructor.id,
        instructorId: instructor.id,
        fullName: instructor.fullName,
        profilePictureUrl: instructor.profilePictureUrl,
        experience: instructor.instructorProfile?.experience || '-',
        license: instructor.instructorProfile?.license || '-',
        shortBio: instructor.instructorProfile?.shortBio || '',
        currentSlots,
        remainingSlots,
        currentStudentCount: currentSlots,
        maxCapacity: MAX_REGULAR_CAPACITY,
      };
    });
};
