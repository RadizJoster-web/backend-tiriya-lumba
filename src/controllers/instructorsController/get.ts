import { Request, Response, NextFunction } from 'express';
import { getInstructorsForManagementService } from '../../services/instructorsService/get';

export const getInstructorsForManagement = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUser = (req as any).user;
    const result = await getInstructorsForManagementService(
      req.query,
      currentUser,
    );

    return res.status(200).json({
      success: true,
      data: result.instructors,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};
