import { Request, Response, NextFunction } from 'express';
import { getPoolManagerByIdService } from '../../services/poolManagerService/getById';

export const getPoolManagerById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const manager = await getPoolManagerByIdService(req.params);
    return res.status(200).json({
      success: true,
      data: manager,
    });
  } catch (error) {
    next(error);
  }
};
