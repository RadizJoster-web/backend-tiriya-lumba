import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { getInstructorsPaginationSchema } from './instructorSchema';

export interface CurrentUserPayload {
  role?: string;
  locationId?: string | null;
}

export const getInstructorsForManagementService = async (
  query: unknown,
  currentUser: CurrentUserPayload,
) => {
  const { page, limit } = getInstructorsPaginationSchema.parse(query);
  const skip = (page - 1) * limit;

  const whereCondition: any = {
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

  const [totalItems, instructors] = await Promise.all([
    prisma.user.count({ where: whereCondition }),
    prisma.user.findMany({
      where: whereCondition,
      skip,
      take: limit,
      select: {
        id: true,
        fullName: true,
        phone: true,
        profilePictureUrl: true,
        isActive: true,
      },
      orderBy: { fullName: 'asc' },
    }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    instructors,
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      limit,
    },
  };
};
