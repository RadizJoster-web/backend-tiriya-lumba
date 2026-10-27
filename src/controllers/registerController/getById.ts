import { Request, Response, NextFunction } from 'express';
import { getRegistrationByIdService } from '../../services/registerService/getById';

export const getRegistrationByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const paramId = req.params.id;
    const id = Array.isArray(paramId) ? paramId[0] : paramId;
    const currentUser = (req as any).user;

    const detailData = await getRegistrationByIdService(id as string, currentUser);
    return res.status(200).json({
      success: true,
      data: detailData,
    });
  } catch (error) {
    next(error);
  }
};
