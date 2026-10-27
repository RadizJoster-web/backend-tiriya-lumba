import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';

export interface CurrentUserPayload {
  role?: string;
  locationId?: string | null;
}

export interface GetRegistrationsFilter {
  status?: string;
  type?: string;
}

export const getRegistrationsService = async (
  currentUser: CurrentUserPayload,
  query: GetRegistrationsFilter,
) => {
  const { status, type } = query;
  const whereCondition: any = {};

  if (status && status !== 'ALL') {
    whereCondition.status = status;
  } else if (!status) {
    whereCondition.status = 'PENDING';
  }

  if (type) {
    whereCondition.type = type;
  }

  if (currentUser.role === 'POOL_MANAGER') {
    if (!currentUser.locationId) {
      throw new AppError(400, 'Lokasi tidak terikat.');
    }
    whereCondition.type = 'NEW_STUDENT';
    whereCondition.locationId = currentUser.locationId;
  }

  const registrations = await prisma.registration.findMany({
    where: whereCondition,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          fullName: true,
          email: true,
          phone: true,
          profilePictureUrl: true,
          studentProfile: {
            select: {
              fullName: true,
              birthDate: true,
            },
          },
          instructorProfile: {
            select: {
              birthDate: true,
              locations: {
                select: { id: true, name: true },
              },
            },
          },
        },
      },
    },
  });

  const locations = await prisma.location.findMany({
    select: { id: true, name: true },
  });
  const locationMap = new Map(locations.map((l) => [l.id, l.name]));

  return registrations.map((reg) => {
    const user = reg.user;
    const studentProfile = user?.studentProfile;
    const instructorProfile = user?.instructorProfile;

    const name = studentProfile?.fullName || user?.fullName || 'Unknown';
    const instructorBirthDate = instructorProfile?.birthDate;

    let locationLabel = '-';
    if (reg.type === 'NEW_STUDENT' && reg.locationId) {
      locationLabel = locationMap.get(reg.locationId) ?? '-';
    } else if (reg.type === 'NEW_INSTRUCTOR') {
      const poolNames = instructorProfile?.locations?.map((l) => l.name) ?? [];
      locationLabel =
        poolNames.length > 0 ? poolNames.join(', ') : 'Semua Kolam';
    }

    return {
      id: reg.id,
      type: reg.type,
      status: reg.status,
      name,
      email: user?.email ?? null,
      phone: user?.phone ?? null,
      lokasi: locationLabel,
      birthDate: studentProfile?.birthDate ?? instructorBirthDate ?? null,
      profilePictureUrl: user?.profilePictureUrl ?? null,
      cvUrl: reg.cvUrl ?? null,
      paymentProofUrl: reg.paymentProofUrl ?? null,
      rejectionReason: reg.rejectionReason ?? null,
      createdAt: reg.createdAt
        ? reg.createdAt.toISOString()
        : new Date().toISOString(),
    };
  });
};
