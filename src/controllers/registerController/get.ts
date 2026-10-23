import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';

export const getRegister = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const registration = await prisma.registration.findMany({
    where: { status: 'PENDING' },
    select: {
      id: true,
      type: true,
      photoUrl: true
    },
  });
};
