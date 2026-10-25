import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';

export const getRegistrationByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const paramId = req.params.id;
    const id = Array.isArray(paramId) ? paramId[0] : paramId;
    const currentUser = (req as any).user;

    const registration = await prisma.registration.findUnique({
      where: { id },
    });

    if (!registration) {
      return res
        .status(404)
        .json({ success: false, message: 'Data pendaftaran tidak ditemukan.' });
    }

    // Proteksi data: Pool Manager hanya boleh melihat detail pendaftaran di lokasinya
    if (
      currentUser.role === 'POOL_MANAGER' &&
      registration.locationId !== currentUser.locationId
    ) {
      return res.status(403).json({
        success: false,
        message:
          'Anda tidak memiliki akses ke detail pendaftaran di kolam ini.',
      });
    }

    // Ambil data relasi tambahan (Package, Location, Instructor, User, Schedules)
    const [packageData, location, instructor, user, schedules] =
      await Promise.all([
        registration.packageId
          ? prisma.package.findUnique({ where: { id: registration.packageId } })
          : null,
        registration.locationId
          ? prisma.location.findUnique({ where: { id: registration.locationId } })
          : null,
        registration.instructorId
          ? prisma.user.findUnique({
              where: { id: registration.instructorId },
              select: { id: true, fullName: true, phone: true },
            })
          : null,
        registration.userId
          ? prisma.user.findUnique({
              where: { id: registration.userId },
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                profilePictureUrl: true,
                studentProfile: true,
                instructorProfile: {
                  include: { locations: true },
                },
              },
            })
          : null,
        registration.userId
          ? prisma.schedule.findMany({
              where: { instructorId: registration.userId },
              include: { location: true },
            })
          : [],
      ]);

    const detailData = {
      ...registration,
      user,
      schedules,
      package: packageData,
      location: location,
      instructor: instructor,
    };

    return res.status(200).json({
      success: true,
      data: detailData,
    });
  } catch (error) {
    next(error);
  }
};
