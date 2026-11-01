import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { paramIdSchema } from './instructorSchema';
import { CurrentUserPayload } from './get';

export const getInstructorByIdForManagementService = async (
  params: unknown,
  currentUser: CurrentUserPayload,
) => {
  const { id } = paramIdSchema.parse(params);

  const whereCondition: any = {
    id,
    role: 'INSTRUCTOR',
  };

  if (currentUser.role === 'POOL_MANAGER') {
    if (!currentUser.locationId) {
      throw new AppError(
        400,
        'Akun Pool Manager Anda tidak terikat dengan lokasi kolam manapun.',
      );
    }

    whereCondition.OR = [
      {
        instructorProfile: {
          locations: {
            some: { id: currentUser.locationId },
          },
        },
      },
      {
        schedules: {
          some: { locationId: currentUser.locationId },
        },
      },
    ];
  }

  // Gunakan select eksplisit untuk memangkas payload & mencegah kebocoran password/token
  const instructor = await prisma.user.findFirst({
    where: whereCondition,
    select: {
      id: true,
      fullName: true,
      phone: true,
      email: true,
      role: true,
      isVerified: true,
      profilePictureUrl: true,
      locationId: true,
      isActive: true,
      instructorProfile: {
        select: {
          id: true,
          userId: true,
          shortBio: true,
          birthDate: true,
          license: true,
          experience: true,
          lastRescheduledAt: true,
          locations: {
            select: { id: true, name: true, category: true },
          },
        },
      },
      schedules: {
        select: {
          id: true,
          dayOfWeek: true,
          sessionName: true,
          locationId: true,
          location: {
            select: { id: true, name: true },
          },
        },
      },
      registrations: {
        where: { type: 'NEW_INSTRUCTOR' },
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: {
          id: true,
          status: true,
          cvUrl: true,
          createdAt: true,
        },
      },
    },
  });

  if (!instructor) {
    throw new AppError(
      404,
      'Data pelatih tidak ditemukan atau Anda tidak memiliki hak akses.',
    );
  }

  return instructor;
};
