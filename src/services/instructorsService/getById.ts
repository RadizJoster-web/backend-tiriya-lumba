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

  const instructor = await prisma.user.findFirst({
    where: whereCondition,
    include: {
      instructorProfile: {
        include: { locations: true },
      },
      schedules: {
        include: { location: true },
      },
      registrations: {
        where: { type: 'NEW_INSTRUCTOR' },
        orderBy: { createdAt: 'desc' },
        take: 1,
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
