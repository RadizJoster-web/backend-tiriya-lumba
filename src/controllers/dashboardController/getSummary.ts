import { Request, Response, NextFunction } from 'express';
import { getDashboardSummaryService } from '../../services/dashboardService/getSummary';

export const getDashboardSummaryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUser = (req as any).user;
    const data = await getDashboardSummaryService(currentUser, req.query);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
