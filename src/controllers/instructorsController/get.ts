// src/controllers/instructorController/index.ts
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { getInstructorsPaginationSchema } from './instructorSchema';

// GET ALL INSTRUCTORS WITH PAGINATION
export const getInstructorsForManagement = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit } = getInstructorsPaginationSchema.parse(req.query);
    const skip = (page - 1) * limit;

    const currentUser = (req as any).user;

    const whereCondition: any = {
      role: 'INSTRUCTOR',
    };

    // Pool Manager hanya melihat guru yang melatih di kolam renangnya
    if (currentUser.role === 'POOL_MANAGER') {
      if (!currentUser.locationId) {
        return res.status(400).json({
          success: false,
          message:
            'Akun Pool Manager Anda tidak terikat dengan lokasi kolam manapun.',
        });
      }

      whereCondition.instructorProfile = {
        locations: {
          some: { id: currentUser.locationId },
        },
      };
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

    return res.status(200).json({
      success: true,
      data: instructors,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};
