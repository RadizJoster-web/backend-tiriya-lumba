import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';

function calculateAge(birthDate?: Date | null): number {
  if (!birthDate) return 0;
  const diff = Date.now() - new Date(birthDate).getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export const getStudentsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUser = (req as any).user;

    // Filter pengguna dengan role STUDENT
    const whereClause: any = {
      role: 'STUDENT',
    };

    // Jika yang login adalah Pengelola Kolam, filter murid berdasarkan lokasi kolamnya
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

    // Ambil data master lokasi & paket untuk mapping nama
    const [locations, packages] = await Promise.all([
      prisma.location.findMany({ select: { id: true, name: true } }),
      prisma.package.findMany({ select: { id: true, type: true } }),
    ]);

    const locationMap = new Map(locations.map((l) => [l.id, l.name]));
    const packageMap = new Map(packages.map((p) => [p.id, p.type]));

    const result = students.map((user) => {
      const profile = user.studentProfile;
      const latestReg = user.registrations?.[0];

      const locationName = latestReg?.locationId
        ? locationMap.get(latestReg.locationId) ?? '-'
        : '-';

      const packageName = latestReg?.packageId
        ? packageMap.get(latestReg.packageId) ?? 'Reguler'
        : 'Reguler';

      // Hitung masa berlaku (default 3 bulan dari tanggal mulai atau 30 hari ke depan)
      let berlakuSd = '-';
      if (latestReg?.firstMeetDate) {
        const d = new Date(latestReg.firstMeetDate);
        d.setMonth(d.getMonth() + 1);
        berlakuSd = d.toISOString().slice(0, 10);
      } else if (latestReg?.createdAt) {
        const d = new Date(latestReg.createdAt);
        d.setMonth(d.getMonth() + 1);
        berlakuSd = d.toISOString().slice(0, 10);
      }

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

    return res.status(200).json({
      success: true,
      totalItems: result.length,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
