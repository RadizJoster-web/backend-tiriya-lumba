import { Request, Response, NextFunction } from 'express';
import { getAreaByIdService } from '../../services/areaService/getById';

export const getAreaById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const area = await getAreaByIdService(req.params);
    return res.status(200).json({
      success: true,
      data: area,
    });
  } catch (error) {
    next(error);
  }
};
