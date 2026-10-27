import { Request, Response, NextFunction } from 'express';
import { getPublicStatsService } from '../../services/statsService/getPublicStats';

export const getPublicStats = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await getPublicStatsService();
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
