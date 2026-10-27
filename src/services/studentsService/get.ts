import { prisma } from '../../config/prisma';
import { calculateAge, calculateValidityDate } from './studentHelper';

export interface CurrentUserPayload {
  role?: string;
  locationId?: string | null;
}

export const getStudentsService = async (currentUser?: CurrentUserPayload) => {
  const whereClause: any = {
    role: 'STUDENT',
  };

  if (currentUser && currentUser.role === 'POOL_MANAGER') {
    if (currentUser.locationId) {
      whereClause.registrations = {
        some: {
          locationId: currentUser.locationId,
          status: 'APPROVED',
        },
      };
    }
  }

  const students = await prisma.user.findMany({
    where: whereClause,
    include: {
      studentProfile: true,
      registrations: {
        where: { type: 'NEW_STUDENT', status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { fullName: 'asc' },
  });

  const [locations, packages] = await Promise.all([
    prisma.location.findMany({ select: { id: true, name: true } }),
    prisma.package.findMany({ select: { id: true, type: true } }),
  ]);

  const locationMap = new Map(locations.map((l) => [l.id, l.name]));
  const packageMap = new Map(packages.map((p) => [p.id, p.type]));

  return students.map((user) => {
    const profile = user.studentProfile;
    const latestReg = user.registrations?.[0];

    const locationName = latestReg?.locationId
      ? locationMap.get(latestReg.locationId) ?? '-'
      : '-';

    const packageName = latestReg?.packageId
      ? packageMap.get(latestReg.packageId) ?? 'Reguler'
      : 'Reguler';

    const berlakuSd = calculateValidityDate(
      latestReg?.firstMeetDate,
      latestReg?.createdAt,
    );

    return {
      id: user.id,
      nama: profile?.fullName || user.fullName,
      usia: calculateAge(profile?.birthDate),
      lokasi: locationName,
      paket: packageName,
      berlakuSd,
      aktif: user.isActive,
      telp: user.phone ?? '-',
      fotoUrl: user.profilePictureUrl ?? undefined,
      profilePictureUrl: user.profilePictureUrl ?? undefined,
    };
  });
};
