import { Request, Response, NextFunction } from 'express';
import { getAvailableInstructorsService } from '../../services/instructorsService/getAvailableInstructors';

export const getAvailableInstructors = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const instructors = await getAvailableInstructorsService(req.query);
    return res.status(200).json({
      success: true,
      data: instructors,
    });
  } catch (error) {
    next(error);
  }
};
