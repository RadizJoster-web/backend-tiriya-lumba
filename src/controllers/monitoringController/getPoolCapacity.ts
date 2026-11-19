import { Request, Response, NextFunction } from 'express';
import { getPoolCapacityService } from '../../services/monitoringService/getPoolCapacity';

export const getPoolCapacity = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user as { role?: string; locationId?: string | null } | undefined;
    const data = await getPoolCapacityService(user);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};
