import { Request, Response, NextFunction } from 'express';
import { getPoolManagersService } from '../../services/poolManagerService/get';

export const getPoolManagers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { locationId } = req.query;
    const managers = await getPoolManagersService(locationId);
    return res.status(200).json({
      success: true,
      data: managers,
    });
  } catch (error) {
    next(error);
  }
};
