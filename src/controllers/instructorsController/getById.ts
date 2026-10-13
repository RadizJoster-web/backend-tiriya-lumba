import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { instructorIdParamSchema } from './instructorSchema';

export const getInstructorByIdForManagement = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = instructorIdParamSchema.parse(req.params);
    const currentUser = (req as any).user;

    const whereCondition: any = {
      id,
      role: 'INSTRUCTOR',
    };

    // Validasi agar Pool Manager tidak bisa mengintip guru kolam lain via ID
    if (currentUser.role === 'POOL_MANAGER') {
      whereCondition.instructorProfile = {
        locations: {
          some: { id: currentUser.locationId },
        },
      };
    }

    const instructor = await prisma.user.findFirst({
      where: whereCondition,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        profilePictureUrl: true,
        isActive: true,
        isVerified: true,
        instructorProfile: {
          select: {
            id: true,
            shortBio: true,
            license: true,
            experience: true,
            locations: {
              select: {
                id: true,
                name: true,
                address: true,
                area: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
      },
    });

    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Data guru tidak ditemukan.',
      });
    }

    return res.status(200).json({
      success: true,
      data: instructor,
    });
  } catch (error) {
    next(error);
  }
};
