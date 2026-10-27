import { Request, Response, NextFunction } from 'express';
import { getStudentByIdService } from '../../services/studentsService/getById';

export const getStudentByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const currentUser = (req as any).user;
    const data = await getStudentByIdService(id, currentUser);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
