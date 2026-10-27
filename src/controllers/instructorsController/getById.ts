import { Request, Response, NextFunction } from 'express';
import { getInstructorByIdForManagementService } from '../../services/instructorsService/getById';

export const getInstructorByIdForManagement = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUser = (req as any).user;
    const instructor = await getInstructorByIdForManagementService(
      req.params,
      currentUser,
    );

    return res.status(200).json({
      success: true,
      data: instructor,
    });
  } catch (error) {
    next(error);
  }
};
