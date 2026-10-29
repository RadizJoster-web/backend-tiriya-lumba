import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { calculateAge, calculateValidityDate } from './studentHelper';
import { CurrentUserPayload } from './get';

export const getStudentByIdService = async (
  id: string,
  currentUser?: CurrentUserPayload,
) => {
  const whereClause: any = {
    id,
    role: 'STUDENT',
  };

  if (currentUser && currentUser.role === 'POOL_MANAGER') {
    if (!currentUser.locationId) {
      throw new AppError(
        403,
        'Akses ditolak: Akun pengelola kolam tidak terikat ke lokasi mana pun.',
      );
    }
    whereClause.registrations = {
      some: {
        locationId: currentUser.locationId,
        status: 'APPROVED',
      },
    };
  }

  const user = await prisma.user.findFirst({
    where: whereClause,
    include: {
      studentProfile: {
        include: {
          attendances: {
            orderBy: { date: 'desc' },
            take: 10,
          },
        },
      },
      registrations: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  if (!user) {
    throw new AppError(
      404,
      'Data siswa tidak ditemukan atau Anda tidak memiliki akses.',
    );
  }

  const profile = user.studentProfile;
  const latestReg = user.registrations?.[0];

  const [locations, packages] = await Promise.all([
    prisma.location.findMany({ select: { id: true, name: true } }),
    prisma.package.findMany({ select: { id: true, type: true } }),
  ]);

  const locationMap = new Map(locations.map((l) => [l.id, l.name]));
  const packageMap = new Map(packages.map((p) => [p.id, p.type]));

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
    fullName: profile?.fullName || user.fullName,
    email: user.email,
    phone: user.phone ?? '-',
    isActive: user.isActive,
    isVerified: user.isVerified,
    profilePictureUrl: user.profilePictureUrl ?? undefined,
    fotoUrl: user.profilePictureUrl ?? undefined,
    createdAt: latestReg?.createdAt ?? null,
    usia: calculateAge(profile?.birthDate),
    lokasi: locationName,
    paket: packageName,
    berlakuSd,
    studentProfile: profile
      ? {
          id: profile.id,
          fullName: profile.fullName,
          birthPlace: profile.birthPlace,
          birthDate: profile.birthDate,
          gender: profile.gender,
          address: profile.address,
          schoolOrOffice: profile.schoolOrOffice,
          tshirtSize: profile.tshirtSize,
          activeSessions: profile.activeSessions,
          attendances: profile.attendances,
        }
      : null,
    registrations: user.registrations.map((r) => ({
      id: r.id,
      type: r.type,
      status: r.status,
      firstMeetDate: r.firstMeetDate,
      firstMeetSession: r.firstMeetSession,
      locationName: r.locationId ? locationMap.get(r.locationId) ?? '-' : '-',
      packageName: r.packageId ? packageMap.get(r.packageId) ?? '-' : '-',
      createdAt: r.createdAt,
    })),
  };
};
