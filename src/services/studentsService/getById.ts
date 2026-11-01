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

  // Paralelkan pengambilan detail student, locations, dan packages
  const [user, locations, packages] = await Promise.all([
    prisma.user.findFirst({
      where: whereClause,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        isActive: true,
        isVerified: true,
        profilePictureUrl: true,
        studentProfile: {
          select: {
            id: true,
            fullName: true,
            birthPlace: true,
            birthDate: true,
            gender: true,
            address: true,
            schoolOrOffice: true,
            tshirtSize: true,
            activeSessions: true,
            attendances: {
              orderBy: { date: 'desc' },
              take: 10,
            },
          },
        },
        registrations: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            type: true,
            status: true,
            firstMeetDate: true,
            firstMeetSession: true,
            locationId: true,
            packageId: true,
            createdAt: true,
          },
        },
      },
    }),
    prisma.location.findMany({ select: { id: true, name: true } }),
    prisma.package.findMany({ select: { id: true, type: true } }),
  ]);

  if (!user) {
    throw new AppError(
      404,
      'Data siswa tidak ditemukan atau Anda tidak memiliki akses.',
    );
  }

  const profile = user.studentProfile;
  const latestReg = user.registrations?.[0];

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
    studentProfile: profile ?? null,
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
