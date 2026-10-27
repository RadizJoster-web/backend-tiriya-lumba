import { Request, Response, NextFunction } from 'express';
import { getStudentsService } from '../../services/studentsService/get';

export const getStudentsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUser = (req as any).user;
    const result = await getStudentsService(currentUser);

    return res.status(200).json({
      success: true,
      totalItems: result.length,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
