import { Request, Response, NextFunction } from 'express';
import { getRegistrationsService } from '../../services/registerService/get';

export const getRegistrationsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUser = (req as any).user;
    const listData = await getRegistrationsService(currentUser, req.query);

    return res.status(200).json({
      success: true,
      totalItems: listData.length,
      data: listData,
    });
  } catch (error) {
    next(error);
  }
};
