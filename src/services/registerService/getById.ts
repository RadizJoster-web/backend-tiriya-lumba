import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { CurrentUserPayload } from './get';

export const getRegistrationByIdService = async (
  id: string,
  currentUser: CurrentUserPayload,
) => {
  const registration = await prisma.registration.findUnique({
    where: { id },
  });

  if (!registration) {
    throw new AppError(404, 'Data pendaftaran tidak ditemukan.');
  }

  if (
    currentUser.role === 'POOL_MANAGER' &&
    registration.locationId !== currentUser.locationId
  ) {
    throw new AppError(
      403,
      'Anda tidak memiliki akses ke detail pendaftaran di kolam ini.',
    );
  }

  const [packageData, location, instructor, user, schedules] =
    await Promise.all([
      registration.packageId
        ? prisma.package.findUnique({ where: { id: registration.packageId } })
        : null,
      registration.locationId
        ? prisma.location.findUnique({
            where: { id: registration.locationId },
          })
        : null,
      registration.instructorId
        ? prisma.user.findUnique({
            where: { id: registration.instructorId },
            select: { id: true, fullName: true, phone: true },
          })
        : null,
      registration.userId
        ? prisma.user.findUnique({
            where: { id: registration.userId },
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              profilePictureUrl: true,
              studentProfile: true,
              instructorProfile: {
                include: { locations: true },
              },
            },
          })
        : null,
      registration.userId
        ? prisma.schedule.findMany({
            where: { instructorId: registration.userId },
            include: { location: true },
          })
        : [],
    ]);

  return {
    ...registration,
    user,
    schedules,
    package: packageData,
    location,
    instructor,
  };
};
