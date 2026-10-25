import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';

export const getRegistrationsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUser = (req as any).user;
    const { status, type } = req.query;

    const whereCondition: any = {
      status: (status as string) || 'PENDING',
    };

    if (type) {
      whereCondition.type = type as string;
    }

    if (currentUser.role === 'POOL_MANAGER') {
      if (!currentUser.locationId) {
        return res
          .status(400)
          .json({ success: false, message: 'Lokasi tidak terikat.' });
      }
      whereCondition.type = 'NEW_STUDENT';
      whereCondition.locationId = currentUser.locationId;
    }

    const registrations = await prisma.registration.findMany({
      where: whereCondition,
      orderBy: { id: 'desc' },
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

    // Ambil master lokasi untuk mapping locationId student
    const locations = await prisma.location.findMany({
      select: { id: true, name: true },
    });
    const locationMap = new Map(locations.map((l) => [l.id, l.name]));

    const listData = registrations.map((reg) => {
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
        locationLabel = poolNames.length > 0 ? poolNames.join(', ') : 'Semua Kolam';
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
      };
    });

    return res.status(200).json({
      success: true,
      totalItems: listData.length,
      data: listData,
    });
  } catch (error) {
    next(error);
  }
};
