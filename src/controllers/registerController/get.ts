import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';

export const getRegistrationsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUser = (req as any).user;
    const whereCondition: any = { status: 'PENDING' };

    if (currentUser.role === 'POOL_MANAGER') {
      if (!currentUser.locationId) {
        return res
          .status(400)
          .json({ success: false, message: 'Lokasi tidak terikat.' });
      }
      whereCondition.type = 'NEW_STUDENT';
      whereCondition.locationId = currentUser.locationId;
    }

    // Ambil data dasar saja
    const registrations = await prisma.registration.findMany({
      where: whereCondition,
      orderBy: { id: 'desc' },
      select: {
        id: true,
        type: true,
        status: true,
        user: {
          select: {
            fullName: true,
            email: true,
            profilePictureUrl: true,
            studentProfile: {
              select: {
                fullName: true,
                birthDate: true,
              },
            },
          },
        },
      },
    });

    // Format data & hitung umur
    const listData = registrations.map((reg) => {
      const user = reg.user;
      const studentProfile = user?.studentProfile;

      // Hierarki Nama: StudentProfile.fullName -> User.fullName -> User.email
      const name = studentProfile?.fullName || user?.fullName || 'Unknown';

      return {
        id: reg.id,
        type: reg.type,
        status: reg.status,
        name,
        email: user?.email ?? null,
        birthDate: studentProfile?.birthDate ?? null,
        profilePictureUrl: user?.profilePictureUrl ?? null,
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
