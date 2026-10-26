import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';

export const getPublicStats = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const [totalStudents, totalInstructors, totalPools, totalAreas] =
      await Promise.all([
        prisma.studentProfile.count(),
        prisma.user.count({
          where: {
            role: 'INSTRUCTOR',
            isActive: true,
          },
        }),
        prisma.location.count(),
        prisma.area.count(),
      ]);

    return res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalInstructors,
        totalPools,
        totalAreas,
      },
    });
  } catch (error) {
    next(error);
  }
};
